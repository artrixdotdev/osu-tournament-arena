#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const ROOT_DIR = resolve(import.meta.dirname, "..");
const GARAGE_DIR = resolve(ROOT_DIR, "packages/storage/.garage");
const CONFIG_PATH = resolve(GARAGE_DIR, "garage.toml");
const META_DIR = resolve(GARAGE_DIR, "meta");
const DATA_DIR = resolve(GARAGE_DIR, "data");
const ENV_PATH = resolve(ROOT_DIR, ".env");

const BUCKETS = ["tournament-media", "replays"];
const TOURNAMENT_MEDIA_BUCKET = "tournament-media";
const S3_API_PORT = 7279;
const RPC_PORT = 7278;
const WEB_PORT = 7277;
const ADMIN_PORT = 7276;
const S3_REGION = "garage";
const TOURNAMENT_MEDIA_PUBLIC_URL = `http://${TOURNAMENT_MEDIA_BUCKET}.web.garage.localhost:${WEB_PORT}`;

const AUTO_KILL = process.argv.includes("-k");

async function run(cmd: string[]): Promise<string> {
   const proc = Bun.spawn(cmd, {
      stdout: "pipe",
      stderr: "pipe",
   });
   const stdout = await new Response(proc.stdout).text();
   const stderr = await new Response(proc.stderr).text();
   const exitCode = await proc.exited;
   if (exitCode !== 0) {
      throw new Error(`Command failed: ${cmd.join(" ")}\n${stderr}\n${stdout}`);
   }
   return stdout.trim();
}

function garageCmd(...args: string[]): string[] {
   return ["garage", "-c", CONFIG_PATH, ...args];
}

async function generateRpcSecret(): Promise<string> {
   const result = await run(["openssl", "rand", "-hex", "32"]);
   return result.trim();
}

function writeConfig(rpcSecret: string) {
   const config = `metadata_dir = "${META_DIR}"
data_dir = "${DATA_DIR}"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:${RPC_PORT}"
rpc_public_addr = "127.0.0.1:${RPC_PORT}"
rpc_secret = "${rpcSecret}"

[s3_api]
s3_region = "${S3_REGION}"
api_bind_addr = "[::]:${S3_API_PORT}"
root_domain = ".s3.garage.localhost"

[s3_web]
bind_addr = "[::]:${WEB_PORT}"
root_domain = ".web.garage.localhost"
index = "index.html"

[admin]
api_bind_addr = "0.0.0.0:${ADMIN_PORT}"
`;
   writeFileSync(CONFIG_PATH, config);
}

async function waitForGarage(maxAttempts = 30, delayMs = 1000): Promise<void> {
   for (let i = 0; i < maxAttempts; i++) {
      try {
         await run(garageCmd("status"));
         return;
      } catch {
         await Bun.sleep(delayMs);
      }
   }
   throw new Error("Garage did not become ready within the timeout period.");
}

function appendEnvVars(vars: Record<string, string>) {
   let existing = "";
   if (existsSync(ENV_PATH)) {
      existing = readFileSync(ENV_PATH, "utf-8");
   }

   const lines = existing.split("\n");
   const existingKeys = new Set(
      lines
         .filter((l) => l.includes("=") && !l.startsWith("#"))
         .map((l) => l.split("=")[0]!.trim()),
   );

   let appended = "";
   for (const [key, value] of Object.entries(vars)) {
      if (existingKeys.has(key)) {
         // Replace the existing line
         const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
         if (idx !== -1) {
            lines[idx] = `${key}=${value}`;
         }
      } else {
         appended += `${key}=${value}\n`;
      }
   }

   let result = lines.join("\n");
   if (appended) {
      if (!result.endsWith("\n")) result += "\n";
      result += `\n# Garage S3 Storage (auto-generated)\n${appended}`;
   }

   writeFileSync(ENV_PATH, result);
}

async function main() {
   console.log("🔧 Bootstrapping Garage S3 storage...\n");

   // 1. Create directories
   console.log("📁 Creating directories...");
   mkdirSync(GARAGE_DIR, { recursive: true });
   mkdirSync(META_DIR, { recursive: true });
   mkdirSync(DATA_DIR, { recursive: true });

   // 2. Generate RPC secret and write config
   console.log("🔑 Generating RPC secret...");
   const rpcSecret = await generateRpcSecret();

   console.log(`📝 Writing config to ${CONFIG_PATH}...`);
   writeConfig(rpcSecret);

   // 3. Start garage server in the background
   console.log("🚀 Starting Garage server...");
   const garageServer = Bun.spawn(garageCmd("server"), {
      stdout: "inherit",
      stderr: "inherit",
      env: { ...process.env, RUST_LOG: "garage=info" },
   });

   // Ensure we kill the server on exit if something goes wrong
   const cleanup = () => {
      try {
         garageServer.kill();
      } catch {}
   };
   process.on("SIGINT", cleanup);
   process.on("SIGTERM", cleanup);

   try {
      // 4. Wait for garage to be ready
      console.log("⏳ Waiting for Garage to be ready...");
      await waitForGarage();
      console.log("✅ Garage is running!\n");

      // 5. Get node ID and configure layout
      console.log("🗺️  Configuring cluster layout...");
      const statusOutput = await run(garageCmd("status"));
      // Parse node ID from status output - it's the first hex string
      const nodeIdMatch = statusOutput.match(/([0-9a-f]{16,})/);
      if (!nodeIdMatch) {
         throw new Error(
            `Could not parse node ID from status output:\n${statusOutput}`,
         );
      }
      const nodeId = nodeIdMatch[1]!;
      const shortId = nodeId.substring(0, 16);

      await run(
         garageCmd("layout", "assign", "-z", "dc1", "-c", "1G", shortId),
      );
      await run(garageCmd("layout", "apply", "--version", "1"));
      console.log("✅ Layout configured.\n");

      // 6. Create buckets
      console.log("🪣 Creating buckets...");
      for (const bucket of BUCKETS) {
         try {
            await run(garageCmd("bucket", "create", bucket));
            console.log(`   ✅ Created bucket: ${bucket}`);
         } catch (e: any) {
            if (e.message?.includes("already exists")) {
               console.log(`   ⚠️  Bucket already exists: ${bucket}`);
            } else {
               throw e;
            }
         }
      }
      console.log();

      // 7. Create API key
      console.log("🔐 Creating API key...");
      const keyOutput = await run(garageCmd("key", "create", "app-key"));

      // Parse key ID and secret from output
      const keyIdMatch = keyOutput.match(/Key ID:\s+(GK[a-f0-9]+)/);
      const secretMatch = keyOutput.match(/Secret key:\s+([a-f0-9]+)/);

      if (!keyIdMatch || !secretMatch) {
         throw new Error(`Could not parse key info from output:\n${keyOutput}`);
      }

      const accessKeyId = keyIdMatch[1]!;
      const secretAccessKey = secretMatch[1]!;
      console.log(`   Key ID: ${accessKeyId}`);
      console.log(`   Secret: ${secretAccessKey.substring(0, 8)}...`);
      console.log();

      // 8. Allow key on all buckets
      console.log("🔓 Granting key permissions on buckets...");
      for (const bucket of BUCKETS) {
         await run(
            garageCmd(
               "bucket",
               "allow",
               "--read",
               "--write",
               "--owner",
               bucket,
               "--key",
               "app-key",
            ),
         );
         console.log(`   ✅ Granted read/write/owner on: ${bucket}`);
      }
      console.log();

      // 9. Write env vars
      console.log("📄 Writing environment variables to .env...");
      appendEnvVars({
         S3_ENDPOINT: `http://127.0.0.1:${S3_API_PORT}`,
         S3_REGION: S3_REGION,
         S3_ACCESS_KEY_ID: accessKeyId,
         S3_SECRET_ACCESS_KEY: secretAccessKey,
         S3_BUCKET_TOURNAMENT_MEDIA: "tournament-media",
         S3_BUCKET_REPLAYS: "replays",
         GARAGE_RPC_SECRET: rpcSecret,
         GARAGE_ADMIN_PORT: String(ADMIN_PORT),
      });
      console.log("✅ Environment variables written to .env\n");

      console.log("🎉 Garage S3 bootstrap complete!");
      console.log(
         "   The Garage server is still running (PID:",
         garageServer.pid,
         ")",
      );
      console.log("   To stop it, run: kill", garageServer.pid);
      console.log(`   S3 endpoint: http://127.0.0.1:${S3_API_PORT}`);
      console.log(`   Admin endpoint: http://127.0.0.1:${ADMIN_PORT}`);

      if (AUTO_KILL) {
         console.log("\n🛑 -k flag detected: stopping Garage server...");
         cleanup();
      }
   } catch (e) {
      cleanup();
      throw e;
   }
}

main().catch((e) => {
   console.error("❌ Bootstrap failed:", e.message || e);
   process.exit(1);
});

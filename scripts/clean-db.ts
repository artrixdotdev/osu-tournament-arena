#!/usr/bin/env bun
import { $, Glob, spawn } from "bun";

// Delete all db.sqlite* files in packages/db
const glob = new Glob("db.sqlite*");
for await (const file of glob.scan("packages/db")) {
   await $`rm -f packages/db/${file}`;
}
console.log("Deleted db.sqlite* files");

// Start the long-running dev process
const devProc = spawn(["bun", "--filter", "@ota/db", "dev"], {
   stdout: "inherit",
   stderr: "inherit",
   killSignal: "SIGTERM",
});

// Wait for dev to be ready
await new Promise((resolve) => setTimeout(resolve, 3000));

try {
   await $`bun --filter @ota/db push`;
   console.log("Push completed successfully!");
} finally {
   await $`pkill -15 -P ${devProc.pid}`;
   await $`kill -15 ${devProc.pid}`;
   await devProc.exited;

   console.log("Dev process cleaned up");
}

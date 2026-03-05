import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

function parseBoolean(input: string) {
   return input === "true" || input === "1";
}

export function storageEnv() {
   const runtimeEnv = {
      STORAGE_S3_ENDPOINT:
         process.env.STORAGE_S3_ENDPOINT ?? process.env.S3_ENDPOINT,
      STORAGE_S3_REGION: process.env.STORAGE_S3_REGION ?? process.env.S3_REGION,
      STORAGE_S3_ACCESS_KEY_ID:
         process.env.STORAGE_S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID,
      STORAGE_S3_SECRET_ACCESS_KEY:
         process.env.STORAGE_S3_SECRET_ACCESS_KEY ??
         process.env.S3_SECRET_ACCESS_KEY,
      STORAGE_S3_FORCE_PATH_STYLE:
         process.env.STORAGE_S3_FORCE_PATH_STYLE ??
         process.env.S3_FORCE_PATH_STYLE,
      STORAGE_S3_BUCKET_REPLAYS:
         process.env.STORAGE_S3_BUCKET_REPLAYS ?? process.env.S3_BUCKET_REPLAYS,
      STORAGE_S3_BUCKET_TOURNAMENT_MEDIA:
         process.env.STORAGE_S3_BUCKET_TOURNAMENT_MEDIA ??
         process.env.S3_BUCKET_TOURNAMENT_MEDIA,
      STORAGE_S3_PUBLIC_URL:
         process.env.STORAGE_S3_PUBLIC_URL ?? process.env.S3_PUBLIC_URL,
   };

   return createEnv({
      server: {
         STORAGE_S3_ENDPOINT: z
            .url()
            .optional()
            .default("http://127.0.0.1:3900"),
         STORAGE_S3_REGION: z.string().min(1).optional().default("garage"),
         STORAGE_S3_ACCESS_KEY_ID: z.string().min(1),
         STORAGE_S3_SECRET_ACCESS_KEY: z.string().min(1),
         STORAGE_S3_FORCE_PATH_STYLE: z
            .string()
            .optional()
            .transform((value) => (value ? parseBoolean(value) : true)),
         STORAGE_S3_BUCKET_REPLAYS: z
            .string()
            .min(1)
            .optional()
            .default("replays"),
         STORAGE_S3_BUCKET_TOURNAMENT_MEDIA: z
            .string()
            .min(1)
            .optional()
            .default("tournament-media"),
         STORAGE_S3_PUBLIC_URL: z.url().optional(),
      },
      runtimeEnv,
      emptyStringAsUndefined: true,
      skipValidation:
         !!process.env.CI || process.env.npm_lifecycle_event === "lint",
   });
}

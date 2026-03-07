import {
   DeleteObjectCommand,
   GetObjectCommand,
   HeadObjectCommand,
   ListObjectsV2Command,
   PutObjectCommand,
   S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { storageEnv } from "@ota/env";

import type {
   DeleteObjectCommandOutput,
   GetObjectCommandOutput,
   HeadObjectCommandOutput,
   ListObjectsV2CommandOutput,
   PutObjectCommandInput,
   PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

/**
 * Logical bucket keys used by the application.
 * These map to physical S3 bucket names via environment variables.
 */
export const STORAGE_BUCKET_KEYS = ["replays", "tournamentMedia"] as const;

export type StorageBucketKey = (typeof STORAGE_BUCKET_KEYS)[number];

/**
 * Resolved S3 client and bucket configuration for the storage layer.
 */
export interface S3StorageConfig {
   endpoint: string;
   region: string;
   accessKeyId: string;
   secretAccessKey: string;
   forcePathStyle: boolean;
   buckets: Record<StorageBucketKey, string>;
   publicUrl?: string;
}

/**
 * Optional runtime overrides for the env-based storage configuration.
 */
export interface S3StorageOverrides {
   endpoint?: string;
   region?: string;
   accessKeyId?: string;
   secretAccessKey?: string;
   forcePathStyle?: boolean;
   publicUrl?: string;
   buckets?: Partial<Record<StorageBucketKey, string>>;
}

/**
 * Input payload for object uploads.
 */
export interface PutObjectInput {
   key: string;
   body: PutObjectCommandInput["Body"];
   contentType?: string;
   cacheControl?: string;
   contentDisposition?: string;
   metadata?: Record<string, string>;
}

/**
 * Optional filters for bucket listing.
 */
export interface ListObjectsInput {
   prefix?: string;
   continuationToken?: string;
   maxKeys?: number;
}

/**
 * Shared options for presigned URL generation.
 */
export interface PresignOptions {
   expiresIn?: number;
}

/**
 * Resolves storage configuration from environment variables with optional
 * per-field runtime overrides.
 */
export function resolveS3StorageConfig(
   overrides: S3StorageOverrides = {},
): S3StorageConfig {
   const env = storageEnv();

   return {
      endpoint: overrides.endpoint ?? env.STORAGE_S3_ENDPOINT,
      region: overrides.region ?? env.STORAGE_S3_REGION,
      accessKeyId: overrides.accessKeyId ?? env.STORAGE_S3_ACCESS_KEY_ID,
      secretAccessKey:
         overrides.secretAccessKey ?? env.STORAGE_S3_SECRET_ACCESS_KEY,
      forcePathStyle:
         overrides.forcePathStyle ?? env.STORAGE_S3_FORCE_PATH_STYLE,
      publicUrl: overrides.publicUrl ?? env.STORAGE_S3_PUBLIC_URL,
      buckets: {
         replays: overrides.buckets?.replays ?? env.STORAGE_S3_BUCKET_REPLAYS,
         tournamentMedia:
            overrides.buckets?.tournamentMedia ??
            env.STORAGE_S3_BUCKET_TOURNAMENT_MEDIA,
      },
   };
}

/**
 * S3-compatible storage client abstraction.
 *
 * Bucket access is always done through logical keys (`replays`,
 * `tournamentMedia`) to keep call sites stable across providers/environments.
 */
export class S3Storage {
   public readonly config: S3StorageConfig;
   public readonly client: S3Client;

   /**
    * @param config resolved storage configuration
    * @param client optional pre-configured S3 client (useful for tests)
    */
   constructor(config: S3StorageConfig, client?: S3Client) {
      this.config = config;
      this.client =
         client ??
         new S3Client({
            endpoint: config.endpoint,
            region: config.region,
            forcePathStyle: config.forcePathStyle,
            credentials: {
               accessKeyId: config.accessKeyId,
               secretAccessKey: config.secretAccessKey,
            },
            requestChecksumCalculation: "WHEN_REQUIRED",
            responseChecksumValidation: "WHEN_REQUIRED",
         });
   }

   /**
    * Returns the physical bucket name for a logical bucket key.
    */
   getBucketName(bucket: StorageBucketKey): string {
      return this.config.buckets[bucket];
   }

   /**
    * Uploads an object to the selected bucket.
    */
   async putObject(
      bucket: StorageBucketKey,
      input: PutObjectInput,
   ): Promise<PutObjectCommandOutput> {
      return this.client.send(
         new PutObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: input.key,
            Body: input.body,
            ContentType: input.contentType,
            CacheControl: input.cacheControl,
            ContentDisposition: input.contentDisposition,
            Metadata: input.metadata,
         }),
      );
   }

   /**
    * Uploads an object and makes it publicly readable.
    *
    * Use this for files that need a stable URL you can store in a database.
    * The returned URL stays valid as long as the object exists and the public
    * base URL does not change.
    *
    * This method uses `ACL: "public-read"`. Some S3-compatible providers
    * disable ACLs. In that case, use a bucket policy instead.
    */
   async putPublicObject(
      bucket: StorageBucketKey,
      input: PutObjectInput,
   ): Promise<PutObjectCommandOutput> {
      return this.client.send(
         new PutObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: input.key,
            Body: input.body,
            ContentType: input.contentType,
            CacheControl: input.cacheControl,
            ContentDisposition: input.contentDisposition,
            Metadata: input.metadata,
            ACL: "public-read",
         }),
      );
   }

   /**
    * Retrieves an object stream and metadata from the selected bucket.
    */
   async getObject(
      bucket: StorageBucketKey,
      key: string,
   ): Promise<GetObjectCommandOutput> {
      return this.client.send(
         new GetObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: key,
         }),
      );
   }

   /**
    * Checks object metadata existence without downloading the object body.
    */
   async headObject(
      bucket: StorageBucketKey,
      key: string,
   ): Promise<HeadObjectCommandOutput> {
      return this.client.send(
         new HeadObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: key,
         }),
      );
   }

   /**
    * Deletes an object from the selected bucket.
    */
   async deleteObject(
      bucket: StorageBucketKey,
      key: string,
   ): Promise<DeleteObjectCommandOutput> {
      return this.client.send(
         new DeleteObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: key,
         }),
      );
   }

   /**
    * Lists objects in a bucket with optional pagination/prefix filtering.
    */
   async listObjects(
      bucket: StorageBucketKey,
      input: ListObjectsInput = {},
   ): Promise<ListObjectsV2CommandOutput> {
      return this.client.send(
         new ListObjectsV2Command({
            Bucket: this.getBucketName(bucket),
            Prefix: input.prefix,
            ContinuationToken: input.continuationToken,
            MaxKeys: input.maxKeys,
         }),
      );
   }

   /**
    * Creates a time-limited presigned URL for object uploads.
    *
    * Use this when a client needs to upload directly to S3 without exposing
    * long-lived credentials.
    */
   async createPresignedPutUrl(
      bucket: StorageBucketKey,
      key: string,
      options: PresignOptions & { contentType?: string } = {},
   ): Promise<string> {
      return getSignedUrl(
         this.client,
         new PutObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: key,
            ...(options.contentType
               ? { ContentType: options.contentType }
               : {}),
         }),
         {
            expiresIn: options.expiresIn,
         },
      );
   }

   /**
    * Creates a time-limited presigned URL for object downloads.
    */
   async createPresignedGetUrl(
      bucket: StorageBucketKey,
      key: string,
      options: PresignOptions = {},
   ): Promise<string> {
      return getSignedUrl(
         this.client,
         new GetObjectCommand({
            Bucket: this.getBucketName(bucket),
            Key: key,
         }),
         {
            expiresIn: options.expiresIn,
         },
      );
   }

   /**
    * Returns a public URL for an object.
    *
    * Uses `publicUrl` when provided, otherwise derives from the S3 endpoint.
    */
   getPublicUrl(bucket: StorageBucketKey, key: string): string {
      const bucketName = this.getBucketName(bucket);

      if (this.config.publicUrl) {
         const base = this.config.publicUrl.replace(/\/$/, "");
         return `${base}/${bucketName}/${key}`;
      }

      const endpoint = this.config.endpoint.replace(/\/$/, "");
      return this.config.forcePathStyle
         ? `${endpoint}/${bucketName}/${key}`
         : `${endpoint.replace("//", `//${bucketName}.`)}/${key}`;
   }
}

/**
 * Factory helper that creates a storage client using env defaults.
 */
export function createS3Storage(overrides: S3StorageOverrides = {}) {
   return new S3Storage(resolveS3StorageConfig(overrides));
}

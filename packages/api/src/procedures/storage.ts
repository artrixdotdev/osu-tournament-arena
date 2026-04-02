import { z } from "zod";

import { createS3Storage } from "@ota/storage";

import { base } from "../orpc";

const storage = createS3Storage();

export const mediaTypeSchema = z.enum(["banner", "icon"]);
export type MediaType = z.infer<typeof mediaTypeSchema>;

const generateUploadUrlSchema = z.object({
   tournamentId: z.string().min(1).optional(),
   public: z.boolean().default(false),
   mediaType: mediaTypeSchema,
   contentType: z
      .string()
      .regex(
         /^image\/(jpeg|png|webp|gif)$/i,
         "Content-Type must be image/jpeg, image/png, image/webp, or image/gif",
      ),
});
export type GenerateUploadUrlInput = z.infer<typeof generateUploadUrlSchema>;

function getFileExtension(contentType: string): string {
   switch (contentType.toLowerCase()) {
      case "image/jpeg":
         return "jpg";
      case "image/png":
         return "png";
      case "image/webp":
         return "webp";
      case "image/gif":
         return "gif";
      default:
         throw new Error(`Unsupported content type: ${contentType}`);
   }
}

function generateMediaKey(
   tournamentId: string | undefined,
   mediaType: MediaType,
   contentType: string,
): string {
   const timestamp = Date.now();
   const extension = getFileExtension(contentType);

   if (tournamentId) {
      if (mediaType === "icon") {
         return `${tournamentId}/${tournamentId}.${extension}`;
      }

      return `${tournamentId}/${mediaType}.${extension}`;
   }

   return `temp/${mediaType}-${timestamp}-${crypto.randomUUID()}.${extension}`;
}

export const storageProcedures = {
   generateUploadUrl: base
      .input(generateUploadUrlSchema)
      .handler(async ({ input }) => {
         const key = generateMediaKey(
            input.tournamentId,
            input.mediaType,
            input.contentType,
         );

         const presignedUrl = await storage.createPresignedPutUrl(
            "tournamentMedia",
            key,
            {
               expiresIn: 300,
               contentType: input.contentType,
            },
         );

         const publicUrl = storage.getPublicUrl("tournamentMedia", key);
         const previewUrl =
            input.public && !storage.config.publicUrl
               ? await storage.createPresignedGetUrl("tournamentMedia", key, {
                    expiresIn: 300,
                 })
               : undefined;

         return {
            uploadUrl: presignedUrl,
            publicUrl,
            key,
            previewUrl,
         };
      }),
};

import { z } from "zod";

import { createS3Storage } from "@ota/storage";

import { base } from "../orpc";

const storage = createS3Storage();

export const mediaTypeSchema = z.enum(["banner", "icon"]);
export type MediaType = z.infer<typeof mediaTypeSchema>;

const tournamentSlugSchema = z
   .string()
   .trim()
   .min(1)
   .max(64)
   .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Tournament ID must be a valid slug");

const generateUploadUrlSchema = z.object({
   tournamentId: tournamentSlugSchema.optional(),
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

function sanitizeTournamentSlug(tournamentId: string): string {
   return tournamentSlugSchema.parse(tournamentId);
}

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
      const sanitizedTournamentId = sanitizeTournamentSlug(tournamentId);

      if (mediaType === "icon") {
         return `${sanitizedTournamentId}/${sanitizedTournamentId}.${extension}`;
      }

      return `${sanitizedTournamentId}/${mediaType}.${extension}`;
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

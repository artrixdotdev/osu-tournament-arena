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

function generateMediaKey(
   tournamentId: string | undefined,
   mediaType: MediaType,
): string {
   const timestamp = Date.now();
   const extension = mediaType === "icon" ? "png" : "webp";

   if (tournamentId) {
      return `${tournamentId}/${mediaType}-${timestamp}.${extension}`;
   }

   return `temp/${mediaType}-${timestamp}-${crypto.randomUUID()}.${extension}`;
}

export const storageProcedures = {
   generateUploadUrl: base
      .input(generateUploadUrlSchema)
      .handler(async ({ input }) => {
         const key = generateMediaKey(input.tournamentId, input.mediaType);

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

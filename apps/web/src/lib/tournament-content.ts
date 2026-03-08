import { client } from "$lib/orpc";

export async function previewTournamentMarkdown(body: string) {
   const result = await client.tournament.previewContentMarkdown({ body });
   return result.renderedBody;
}

function buildTournamentMediaSnippet(file: File, publicUrl: string) {
   if (file.type.startsWith("image/")) {
      return `![${file.name}](${publicUrl})`;
   }

   if (file.type.startsWith("video/")) {
      return `<video controls src="${publicUrl}"></video>`;
   }

   if (file.type.startsWith("audio/")) {
      return `<audio controls src="${publicUrl}"></audio>`;
   }

   return `[${file.name}](${publicUrl})`;
}

export async function uploadTournamentMarkdownFiles(
   tournamentId: string,
   files: File[],
) {
   const snippets: string[] = [];

   for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
         throw new Error("Each file must be 4 MB or smaller.");
      }

      const upload = await client.tournament.createContentMediaUpload({
         id: tournamentId,
         fileName: file.name,
         contentType: file.type || "application/octet-stream",
         sizeBytes: file.size,
      });

      const response = await fetch(upload.uploadUrl, {
         method: "PUT",
         body: file,
         headers: {
            "Content-Type": file.type,
         },
      });

      if (!response.ok) {
         throw new Error(`Upload failed with status ${response.status}.`);
      }

      snippets.push(buildTournamentMediaSnippet(file, upload.publicUrl));
   }

   return snippets;
}

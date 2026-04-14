export function uploadFile(
   putUrl: string,
   file: File,
   headers: Record<string, string> = {},
) {
   const sanitizedHeaders = Object.fromEntries(
      Object.entries(headers).filter(
         ([key]) => key.toLowerCase() !== "content-type",
      ),
   );

   return fetch(putUrl, {
      method: "PUT",
      body: file,
      headers: {
         ...sanitizedHeaders,
         "Content-Type": file.type,
      },
   });
}

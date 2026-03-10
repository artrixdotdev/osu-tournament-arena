export function uploadFile(
   putUrl: string,
   file: File,
   headers: Record<string, string> = {},
) {
   return fetch(putUrl, {
      method: "PUT",
      body: file,
      headers: {
         "Content-Type": file.type,
         ...headers,
      },
   });
}

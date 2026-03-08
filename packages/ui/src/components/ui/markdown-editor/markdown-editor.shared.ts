import type { HTMLAttributes } from "svelte/elements";

import type { WithElementRef, WithoutChildren } from "@ota/ui/utils.js";

export interface MarkdownEditorUploadContext {
   files: File[];
}

export type MarkdownEditorUploadHandler = (
   context: MarkdownEditorUploadContext,
) => Promise<string[]>;

export type MarkdownEditorPreviewHandler = (
   value: string,
) => Promise<string>;

export type MarkdownEditorProps = WithoutChildren<
   WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> & {
   value?: string;
   previewHtml?: string;
   placeholder?: string;
   previewPlaceholder?: string;
   accept?: string;
   rows?: number;
   disabled?: boolean;
   writeLabel?: string;
   previewLabel?: string;
   uploadLabel?: string;
   dropLabel?: string;
   onPreviewRequest?: MarkdownEditorPreviewHandler;
   onUploadFiles?: MarkdownEditorUploadHandler;
};

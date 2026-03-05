import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const MARKDOWN_ALLOWED_TAGS = [
   "h1",
   "h2",
   "h3",
   "h4",
   "h5",
   "h6",
   "p",
   "a",
   "blockquote",
   "ul",
   "ol",
   "li",
   "strong",
   "em",
   "code",
   "pre",
   "hr",
   "br",
   "table",
   "thead",
   "tbody",
   "tr",
   "th",
   "td",
   "img",
   "video",
   "audio",
   "source",
] as const;

const MARKDOWN_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
   a: ["href", "name", "target", "rel"],
   img: ["src", "alt", "title", "width", "height", "loading"],
   video: ["src", "controls", "width", "height", "poster", "preload"],
   audio: ["src", "controls", "preload"],
   source: ["src", "type"],
   "*": ["class"],
};

const MARKDOWN_ALLOWED_SCHEMES = ["http", "https", "mailto", "tel"];

export async function renderSafeTournamentMarkdown(
   body: string,
): Promise<string> {
   const unsafeHtml = await marked.parse(body, {
      breaks: true,
      gfm: true,
   });

   return sanitizeHtml(unsafeHtml, {
      allowedTags: [...MARKDOWN_ALLOWED_TAGS],
      allowedAttributes: MARKDOWN_ALLOWED_ATTRIBUTES,
      allowedSchemes: MARKDOWN_ALLOWED_SCHEMES,
      disallowedTagsMode: "discard",
      transformTags: {
         a: sanitizeHtml.simpleTransform("a", {
            target: "_blank",
            rel: "noopener noreferrer nofollow",
         }),
      },
   });
}

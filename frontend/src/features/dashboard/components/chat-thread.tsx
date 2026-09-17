import type { RefObject } from "react";
import { Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ThinkingIndicator } from "../../../components/ui";
import { fileUrl } from "../../../lib/utils";
import type { Message } from "../types";

export default function ChatThread({
  messages,
  sending,
  bottomRef,
}: {
  messages: Message[];
  sending: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}) {
  // Chat images (persisted thumbnails) load async with unknown height, so the
  // page grows after the open-chat scroll runs and the view ends up stuck in
  // between. Re-pin to the absolute bottom when a PERSISTED image finishes
  // loading, but only if the user is already near the bottom (just opened)
  // so reading history never yanks. Just-sent blob previews are excluded:
  // asking a question must never scroll.
  const pinToBottomIfNear = () => {
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 300;
    if (nearBottom) {
      window.scrollTo(0, document.documentElement.scrollHeight);
    }
  };
  return (
    <div className="space-y-3" aria-live="polite">
      {messages.map((m) => {
        const isUser = m.role === "user";
        const imagePreview =
          m.attachmentPreview?.kind === "image" ? m.attachmentPreview : undefined;
        const filePreview =
          m.attachmentPreview?.kind === "file" ? m.attachmentPreview : undefined;
        // Persisted attachment (survives reload): prefer the little thumbnail
        // for images, falling back to the stored original. Optimistic blob
        // preview is only for the just-sent bubble before reload.
        const persistedThumb = m.attachment_thumbnail
          ? fileUrl(m.attachment_thumbnail)
          : null;
        const persistedOriginal = m.attachment ? fileUrl(m.attachment) : null;
        const persistedName = (m.attachment_name || "").trim();
        const isPersistedImage =
          m.attachment_kind === "image" && (persistedThumb || persistedOriginal);
        const persistedImageSrc = persistedThumb ?? persistedOriginal;
        const imageSrc = isPersistedImage
          ? persistedImageSrc
          : (imagePreview?.url ?? null);
        const imageAlt = isPersistedImage
          ? persistedName || "Attached image"
          : (imagePreview?.name ?? "Attached image");
        const isPersistedFile =
          !!persistedOriginal &&
          !isPersistedImage &&
          m.attachment_kind !== "" &&
          persistedName !== "";
        const fileHref = isPersistedFile ? persistedOriginal : null;
        const fileName = isPersistedFile
          ? persistedName
          : (filePreview?.name ?? "");
        const fullSizeHref =
          isPersistedImage &&
          persistedThumb &&
          persistedOriginal &&
          persistedThumb !== persistedOriginal
            ? persistedOriginal
            : null;
        return (
          <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
              {imageSrc && (
                fullSizeHref ? (
                  <a
                    href={fullSizeHref ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    title={`${imageAlt} — open full size`}
                    className="mb-2 block max-w-full"
                  >
                    <img
                      src={imageSrc ?? undefined}
                      alt={imageAlt}
                      title={imageAlt}
                      onLoad={isPersistedImage ? pinToBottomIfNear : undefined}
                      className="max-h-64 w-auto max-w-full rounded-xl border border-[#E0E0E0] object-cover"
                    />
                  </a>
                ) : (
                  <img
                    src={imageSrc ?? undefined}
                    alt={imageAlt}
                    title={imageAlt}
                    onLoad={isPersistedImage ? pinToBottomIfNear : undefined}
                    className="max-h-64 w-auto max-w-full rounded-xl border border-[#E0E0E0] object-cover"
                  />
                )
              )}
              <div
                className={
                  isUser
                    ? "max-w-full rounded-xl rounded-br-sm bg-black px-4 py-3 text-base leading-[22.4px] font-normal text-white"
                    : "max-w-full rounded-xl rounded-bl-sm bg-white px-4 py-3 text-base leading-[22.4px] font-normal text-black"
                }
              >
                <div className="[&>p+p]:mt-3 [&>ul]:mt-2 [&>ol]:mt-2">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {(fileHref || filePreview) && (
                  <p className="mt-2 flex">
                    {fileHref ? (
                      <a
                        href={fileHref ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        title={`${fileName} — open attached file`}
                        className={`font-display inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs leading-4 font-medium ${
                          isUser ? "bg-white/15 text-white" : "bg-[#F5F5F5] text-black"
                        }`}
                      >
                        <Paperclip className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{fileName}</span>
                      </a>
                    ) : (
                      <span
                        className={`font-display inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs leading-4 font-medium ${
                          isUser ? "bg-white/15 text-white" : "bg-[#F5F5F5] text-black"
                        }`}
                      >
                        <Paperclip className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{fileName}</span>
                      </span>
                    )}
                  </p>
                )}
                {(m.sources ?? []).length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {(m.sources ?? []).map((s, i) => (
                      <span
                        key={s.document_id ?? `${s.document_name}-${i}`}
                        title={s.origin === "attachment" ? "Attached file" : undefined}
                        className={`font-display inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs leading-4 font-medium text-black ${
                          s.origin === "attachment" ? "bg-[#E8DFF7]" : "bg-[#DDEAF6]"
                        }`}
                      >
                        <Paperclip className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {s.document_name.split("/").pop()}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {sending && (
        <div className="inline-block rounded-xl rounded-bl-sm bg-white px-4 py-3">
          <ThinkingIndicator label="Thinking" />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

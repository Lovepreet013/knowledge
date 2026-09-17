import type { RefObject } from "react";
import { Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ThinkingIndicator } from "../../../components/ui";
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
  return (
    <div className="space-y-3" aria-live="polite">
      {messages.map((m) => {
        const isUser = m.role === "user";
        const imagePreview =
          m.attachmentPreview?.kind === "image" ? m.attachmentPreview : undefined;
        const filePreview =
          m.attachmentPreview?.kind === "file" ? m.attachmentPreview : undefined;
        return (
          <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
              {imagePreview?.url && (
                <img
                  src={imagePreview.url}
                  alt={imagePreview.name}
                  title={imagePreview.name}
                  className="mb-2 max-h-64 w-auto max-w-full rounded-xl border border-[#E0E0E0] object-cover"
                />
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
                {filePreview && (
                  <p className="mt-2 flex">
                    <span
                      className={`font-display inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs leading-4 font-medium ${
                        isUser ? "bg-white/15 text-white" : "bg-[#F5F5F5] text-black"
                      }`}
                    >
                      <Paperclip className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{filePreview.name}</span>
                    </span>
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

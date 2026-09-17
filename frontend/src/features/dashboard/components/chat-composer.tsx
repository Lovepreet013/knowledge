import type { RefObject } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";

export default function ChatComposer({
  id,
  input,
  attachment,
  sending,
  canChat,
  composerRef,
  fileInputRef,
  onInputChange,
  onAttach,
  onRemoveAttachment,
  onSend,
}: {
  id: string;
  input: string;
  attachment: File | null;
  sending: boolean;
  canChat: boolean;
  composerRef: RefObject<HTMLInputElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onAttach: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: () => void;
  onSend: (e: React.FormEvent) => void;
}) {
  const sendDisabled = sending || input.trim() === "" || !canChat;

  return (
    <form onSubmit={onSend} className="w-full" aria-label="Ask your documents">
      {attachment && (
        <div className="mb-2 flex justify-start">
          <span className="font-display inline-flex max-w-full items-center gap-2 rounded-full border border-[#E0E0E0] bg-white py-1 pr-1 pl-3 text-sm leading-[18.2px] font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="max-w-48 truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={onRemoveAttachment}
              disabled={sending}
              aria-label={`Remove ${attachment.name}`}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-[#666666] transition hover:bg-[#F5F5F5] hover:text-black disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </span>
        </div>
      )}
      <div className="flex min-h-[56px] w-full items-center gap-2 rounded-full border border-[#E0E0E0] bg-white py-2 pr-2 pl-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:pl-5">
        <label htmlFor={id} className="sr-only">
          Ask about your company documents
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.png,.jpg,.jpeg"
          onChange={onAttach}
          disabled={sending || !canChat}
          aria-label="Attach a file"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || !canChat}
          aria-label="Attach a file"
          title="Attach a file"
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-black transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:text-[#CCCCCC] disabled:hover:bg-transparent"
        >
          <Paperclip className="h-5 w-5" aria-hidden="true" />
        </button>
        <input
          ref={composerRef}
          id={id}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={canChat ? "Ask about your company documents…" : "Join a company to start chatting…"}
          disabled={sending || !canChat}
          autoComplete="off"
          className="min-h-[40px] min-w-0 flex-1 bg-transparent text-base leading-[23.2px] font-normal text-black outline-none placeholder:text-[#999999] disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={sendDisabled}
          aria-label="Send message"
          title="Send message"
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-black text-white transition hover:opacity-85 active:bg-[#1A1A1A] disabled:cursor-not-allowed disabled:bg-[#CCCCCC] disabled:text-white disabled:hover:opacity-100"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

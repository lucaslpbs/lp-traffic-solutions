import { useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
}

type MarkdownAction =
  | { type: "wrap"; before: string; after: string }
  | { type: "line-prefix"; prefix: string }
  | { type: "block"; before: string; after: string };

const actions: Record<string, MarkdownAction> = {
  bold: { type: "wrap", before: "**", after: "**" },
  italic: { type: "wrap", before: "_", after: "_" },
  underline: { type: "wrap", before: "<u>", after: "</u>" },
  strikethrough: { type: "wrap", before: "~~", after: "~~" },
  link: { type: "wrap", before: "[", after: "](url)" },
  ul: { type: "line-prefix", prefix: "- " },
  ol: { type: "line-prefix", prefix: "1. " },
  quote: { type: "line-prefix", prefix: "> " },
  code: { type: "wrap", before: "`", after: "`" },
  codeblock: { type: "block", before: "```\n", after: "\n```" },
  divider: { type: "block", before: "\n---\n", after: "" },
};

const toolbarButtons = [
  { id: "bold", icon: Bold, title: "Negrito" },
  { id: "italic", icon: Italic, title: "Itálico" },
  { id: "underline", icon: Underline, title: "Sublinhado" },
  { id: "strikethrough", icon: Strikethrough, title: "Tachado" },
  { id: "link", icon: Link, title: "Link" },
  { id: "divider-sep", icon: null, title: "" },
  { id: "ul", icon: List, title: "Lista" },
  { id: "ol", icon: ListOrdered, title: "Lista numerada" },
  { id: "quote", icon: Quote, title: "Citação" },
  { id: "divider-sep2", icon: null, title: "" },
  { id: "code", icon: Code, title: "Código inline" },
  { id: "divider", icon: Minus, title: "Divisor" },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Digite aqui...",
  readOnly = false,
  minHeight = "120px",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyAction = useCallback(
    (actionId: string) => {
      const ta = textareaRef.current;
      if (!ta || !onChange) return;

      const action = actions[actionId];
      if (!action) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.substring(start, end);

      let newText: string;
      let cursorPos: number;

      if (action.type === "wrap") {
        const wrapped = `${action.before}${selected || "texto"}${action.after}`;
        newText = value.substring(0, start) + wrapped + value.substring(end);
        cursorPos = selected
          ? start + wrapped.length
          : start + action.before.length;
      } else if (action.type === "line-prefix") {
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        newText =
          value.substring(0, lineStart) +
          action.prefix +
          value.substring(lineStart);
        cursorPos = start + action.prefix.length;
      } else {
        const insert = `${action.before}${selected}${action.after}`;
        newText = value.substring(0, start) + insert + value.substring(end);
        cursorPos = start + action.before.length + selected.length;
      }

      onChange(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  if (readOnly) {
    return (
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/85 prose-strong:text-foreground prose-em:text-foreground/85 prose-a:text-primary prose-code:text-primary prose-code:bg-surface-3 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-li:text-foreground/85 prose-hr:border-border prose-pre:bg-card prose-pre:border prose-pre:border-border">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {value || "—"}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-surface-3 bg-surface-2 overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-surface-3 bg-surface-2">
        {toolbarButtons.map((btn) => {
          if (!btn.icon) {
            return (
              <div
                key={btn.id}
                className="w-px h-5 bg-zinc-700 mx-1"
              />
            );
          }
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => applyAction(btn.id)}
              title={btn.title}
              className="p-1.5 rounded hover:bg-zinc-700/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-foreground text-sm px-3 py-2.5 resize-y outline-none placeholder:text-muted-foreground/80"
        style={{ minHeight }}
      />
    </div>
  );
}

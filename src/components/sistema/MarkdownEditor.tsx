import { useRef, useCallback, useState, useEffect } from "react";
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
  ListChecks,
  Quote,
  Code,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Table,
  LayoutTemplate,
  PenLine,
  Columns2,
  Eye,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Marca onde o cursor fica após inserir um bloco. */
export const CURSOR_MARKER = "{{cursor}}";

export interface MarkdownSnippet {
  label: string;
  description?: string;
  content: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  /** Mostra a prévia renderizada ao lado do editor (preenche a altura do container pai). */
  preview?: boolean;
  /** Blocos prontos exibidos no menu "Blocos" da barra de ferramentas. */
  snippets?: MarkdownSnippet[];
  autoFocus?: boolean;
}

type MarkdownAction =
  | { type: "wrap"; before: string; after: string; placeholder: string }
  | { type: "line-prefix"; prefix: string }
  | { type: "heading"; level: number }
  | { type: "block"; content: string };

const TABLE_TEMPLATE = "| Coluna 1 | Coluna 2 |\n|---|---|\n|  |  |\n";

const actions: Record<string, MarkdownAction> = {
  h1: { type: "heading", level: 1 },
  h2: { type: "heading", level: 2 },
  h3: { type: "heading", level: 3 },
  bold: { type: "wrap", before: "**", after: "**", placeholder: "texto" },
  italic: { type: "wrap", before: "_", after: "_", placeholder: "texto" },
  underline: { type: "wrap", before: "<u>", after: "</u>", placeholder: "texto" },
  strikethrough: { type: "wrap", before: "~~", after: "~~", placeholder: "texto" },
  code: { type: "wrap", before: "`", after: "`", placeholder: "código" },
  link: { type: "wrap", before: "[", after: "](url)", placeholder: "texto" },
  ul: { type: "line-prefix", prefix: "- " },
  ol: { type: "line-prefix", prefix: "1. " },
  task: { type: "line-prefix", prefix: "- [ ] " },
  quote: { type: "line-prefix", prefix: "> " },
  table: { type: "block", content: TABLE_TEMPLATE },
  divider: { type: "block", content: "---\n" },
};

type ToolbarItem = { id: string; icon: LucideIcon; title: string } | { id: string; separator: true };

const toolbarButtons: ToolbarItem[] = [
  { id: "h1", icon: Heading1, title: "Título (Ctrl+Alt+1)" },
  { id: "h2", icon: Heading2, title: "Subtítulo (Ctrl+Alt+2)" },
  { id: "h3", icon: Heading3, title: "Seção (Ctrl+Alt+3)" },
  { id: "sep1", separator: true },
  { id: "bold", icon: Bold, title: "Negrito (Ctrl+B)" },
  { id: "italic", icon: Italic, title: "Itálico (Ctrl+I)" },
  { id: "underline", icon: Underline, title: "Sublinhado (Ctrl+U)" },
  { id: "strikethrough", icon: Strikethrough, title: "Tachado" },
  { id: "code", icon: Code, title: "Destaque / código (Ctrl+E)" },
  { id: "link", icon: Link, title: "Link (Ctrl+K)" },
  { id: "sep2", separator: true },
  { id: "ul", icon: List, title: "Lista (Ctrl+Shift+8)" },
  { id: "ol", icon: ListOrdered, title: "Lista numerada (Ctrl+Shift+7)" },
  { id: "task", icon: ListChecks, title: "Lista de tarefas" },
  { id: "quote", icon: Quote, title: "Citação" },
  { id: "sep3", separator: true },
  { id: "table", icon: Table, title: "Tabela" },
  { id: "divider", icon: Minus, title: "Divisor" },
];

const LIST_RE = /^(\s*)(- \[[ xX]\] |[-*+] |(\d+)\. |> )/;
const HEADING_RE = /^#{1,6} /;

const previewClasses =
  "prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-h1:text-xl prose-h1:mb-3 prose-h2:text-lg prose-h2:mt-6 prose-h3:text-base prose-p:text-foreground/85 prose-strong:text-foreground prose-em:text-foreground/85 prose-a:text-primary prose-code:text-primary prose-code:bg-surface-3 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-li:text-foreground/85 prose-li:marker:text-primary prose-hr:border-surface-3 prose-hr:my-8 prose-pre:bg-card prose-pre:border prose-pre:border-border prose-table:my-4 prose-table:text-sm prose-th:bg-surface-2 prose-th:text-foreground prose-th:px-3 prose-th:py-2 prose-th:border prose-th:border-surface-3 prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-surface-3 prose-td:text-foreground/85";

export function MarkdownPreview({ value, emptyText = "—" }: { value: string; emptyText?: string }) {
  return (
    <div className={previewClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {value || emptyText}
      </ReactMarkdown>
    </div>
  );
}

type ViewMode = "edit" | "split" | "preview";

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Digite aqui...",
  readOnly = false,
  minHeight = "120px",
  preview = false,
  snippets,
  autoFocus = false,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ViewMode>(() =>
    preview && typeof window !== "undefined" && window.innerWidth >= 1024 ? "split" : "edit"
  );

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const ta = textareaRef.current;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [autoFocus]);

  /**
   * Substitui o trecho [start, end) por `text` e posiciona a seleção.
   * Usa execCommand para manter o histórico de desfazer (Ctrl+Z) do navegador.
   */
  const replaceRange = useCallback(
    (start: number, end: number, text: string, selStart: number, selEnd = selStart) => {
      const ta = textareaRef.current;
      if (!ta || !onChange) return;
      if (start === end && !text) return;
      ta.focus();
      ta.setSelectionRange(start, end);
      let ok = false;
      try {
        ok = text
          ? document.execCommand("insertText", false, text)
          : document.execCommand("delete");
      } catch {
        ok = false;
      }
      if (ok) {
        ta.setSelectionRange(selStart, selEnd);
        return;
      }
      onChange(ta.value.substring(0, start) + text + ta.value.substring(end));
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(selStart, selEnd);
      });
    },
    [onChange]
  );

  const insertBlock = useCallback(
    (rawContent: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const markerIdx = rawContent.indexOf(CURSOR_MARKER);
      const content = rawContent.replace(CURSOR_MARKER, "");
      const text = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      // Garante uma linha em branco antes e depois do bloco
      const before = text.substring(0, start);
      const prefix = before.length === 0 ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      const after = text.substring(end);
      const suffix = after.startsWith("\n") || after.length === 0 ? "" : "\n";
      const insert = prefix + content + suffix;
      // Posiciona o cursor no marcador do bloco, ou no primeiro campo vazio de tabela
      const firstEmptyCell = content.indexOf("|  |");
      const offset =
        markerIdx >= 0 ? markerIdx : firstEmptyCell >= 0 ? firstEmptyCell + 2 : content.length;
      const cursor = start + prefix.length + offset;
      replaceRange(start, end, insert, cursor);
    },
    [replaceRange]
  );

  const applyAction = useCallback(
    (actionId: string) => {
      const ta = textareaRef.current;
      if (!ta || !onChange) return;
      const action = actions[actionId];
      if (!action) return;

      const text = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = text.substring(start, end);

      if (action.type === "wrap") {
        // Se já está envolvido, remove a formatação
        const outerStart = start - action.before.length;
        const outerEnd = end + action.after.length;
        if (
          selected &&
          text.substring(outerStart, start) === action.before &&
          text.substring(end, outerEnd) === action.after
        ) {
          replaceRange(outerStart, outerEnd, selected, outerStart, outerStart + selected.length);
          return;
        }
        const inner = selected || action.placeholder;
        const wrapped = `${action.before}${inner}${action.after}`;
        const innerStart = start + action.before.length;
        replaceRange(start, end, wrapped, innerStart, innerStart + inner.length);
        return;
      }

      if (action.type === "block") {
        insertBlock(action.content);
        return;
      }

      // Ações por linha: aplicam em todas as linhas da seleção
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const nextBreak = text.indexOf("\n", end > start && text[end - 1] === "\n" ? end - 1 : end);
      const lineEnd = nextBreak === -1 ? text.length : nextBreak;
      const lines = text.substring(lineStart, lineEnd).split("\n");

      let newLines: string[];
      if (action.type === "heading") {
        const hashes = "#".repeat(action.level) + " ";
        const allSame = lines.every((l) => l.startsWith(hashes));
        newLines = lines.map((l) => {
          const stripped = l.replace(HEADING_RE, "");
          return allSame ? stripped : hashes + stripped;
        });
      } else {
        const prefix = action.prefix;
        const isOl = actionId === "ol";
        const matches = (l: string) => {
          const m = l.match(LIST_RE);
          if (!m) return false;
          if (isOl) return m[3] !== undefined;
          return m[2] === prefix;
        };
        const nonEmpty = lines.filter((l) => l.trim());
        const allHave = nonEmpty.length > 0 && nonEmpty.every(matches);
        let n = 0;
        newLines = lines.map((l) => {
          if (!l.trim() && lines.length > 1) return l;
          const m = l.match(LIST_RE);
          const indent = m ? m[1] : l.match(/^\s*/)?.[0] ?? "";
          const content = m ? l.substring(m[0].length) : l.substring(indent.length);
          if (allHave) return indent + content;
          n += 1;
          return indent + (isOl ? `${n}. ` : prefix) + content;
        });
      }

      const replaced = newLines.join("\n");
      const oldLen = lineEnd - lineStart;
      if (lines.length === 1) {
        const delta = replaced.length - oldLen;
        const cursor = Math.max(lineStart, end + delta);
        replaceRange(lineStart, lineEnd, replaced, cursor);
      } else {
        replaceRange(lineStart, lineEnd, replaced, lineStart, lineStart + replaced.length);
      }
    },
    [onChange, replaceRange, insertBlock]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const mod = e.ctrlKey || e.metaKey;

    if (mod && !e.altKey) {
      const key = e.key.toLowerCase();
      const map: Record<string, string> = { b: "bold", i: "italic", u: "underline", k: "link", e: "code" };
      if (!e.shiftKey && map[key]) {
        e.preventDefault();
        applyAction(map[key]);
        return;
      }
      if (e.shiftKey && (e.code === "Digit8" || e.code === "Digit7")) {
        e.preventDefault();
        applyAction(e.code === "Digit8" ? "ul" : "ol");
        return;
      }
    }
    if (mod && e.altKey && ["Digit1", "Digit2", "Digit3"].includes(e.code)) {
      e.preventDefault();
      applyAction(`h${e.code.slice(-1)}`);
      return;
    }

    const text = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = text.indexOf("\n", start);
    const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
    const line = text.substring(lineStart, lineEnd);

    // Tab / Shift+Tab: recua ou avança listas (ou as linhas selecionadas)
    if (e.key === "Tab" && !mod && !e.altKey) {
      e.preventDefault();
      const selLineEndIdx = text.indexOf("\n", end);
      const blockEnd = selLineEndIdx === -1 ? text.length : selLineEndIdx;
      const block = text.substring(lineStart, blockEnd);
      const blockLines = block.split("\n");
      if (e.shiftKey) {
        const out = blockLines.map((l) => l.replace(/^( {1,2}|\t)/, ""));
        const removedFirst = blockLines[0].length - out[0].length;
        const joined = out.join("\n");
        if (joined === block) return;
        if (start === end) {
          replaceRange(lineStart, blockEnd, joined, Math.max(lineStart, start - removedFirst));
        } else {
          replaceRange(lineStart, blockEnd, joined, lineStart, lineStart + joined.length);
        }
      } else if (start === end && !LIST_RE.test(line)) {
        replaceRange(start, end, "  ", start + 2);
      } else {
        const joined = blockLines.map((l) => "  " + l).join("\n");
        if (start === end) {
          replaceRange(lineStart, blockEnd, joined, start + 2);
        } else {
          replaceRange(lineStart, blockEnd, joined, lineStart, lineStart + joined.length);
        }
      }
      return;
    }

    // Enter: continua listas / citações / linhas de tabela automaticamente
    if (e.key === "Enter" && !e.shiftKey && !mod && !e.altKey && start === end && !e.nativeEvent.isComposing) {
      const beforeCursor = text.substring(lineStart, start);

      const listMatch = beforeCursor.match(LIST_RE);
      if (listMatch) {
        e.preventDefault();
        const [full, indent, marker, num] = listMatch;
        const content = line.substring(full.length).trim();
        if (!content) {
          // Item vazio: sai da lista
          replaceRange(lineStart, lineEnd, "", lineStart);
          return;
        }
        let nextMarker = marker;
        if (num !== undefined) nextMarker = `${parseInt(num, 10) + 1}. `;
        else if (marker.startsWith("- [")) nextMarker = "- [ ] ";
        const insert = "\n" + indent + nextMarker;
        replaceRange(start, end, insert, start + insert.length);
        return;
      }

      const trimmed = line.trim();
      const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1;
      const isSeparator = /^\|[\s:|-]+\|$/.test(trimmed);
      if (isTableRow && start === lineEnd) {
        e.preventDefault();
        const cells = trimmed.split("|").length - 2;
        if (!isSeparator && trimmed.replace(/[|\s]/g, "") === "") {
          // Linha de tabela vazia: sai da tabela
          replaceRange(lineStart, lineEnd, "", lineStart);
          return;
        }
        const row = "|" + "  |".repeat(Math.max(cells, 1));
        const insert = "\n" + row;
        replaceRange(start, end, insert, start + 3);
        return;
      }
    }
  };

  // Rolagem sincronizada entre editor e prévia: segue o painel que o usuário está usando
  const scrollSource = useRef<"editor" | "preview">("editor");
  const syncScroll = (source: "editor" | "preview") => {
    const from = source === "editor" ? textareaRef.current : previewRef.current;
    const to = source === "editor" ? previewRef.current : textareaRef.current;
    if (!from || !to || mode !== "split" || scrollSource.current !== source) return;
    const max = from.scrollHeight - from.clientHeight;
    const ratio = max > 0 ? from.scrollTop / max : 0;
    to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
  };

  if (readOnly) {
    return <MarkdownPreview value={value} />;
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-surface-3 bg-surface-2">
      {toolbarButtons.map((btn) => {
        if ("separator" in btn) {
          return <div key={btn.id} className="w-px h-5 bg-surface-3 mx-1" />;
        }
        const Icon = btn.icon;
        return (
          <button
            key={btn.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyAction(btn.id)}
            title={btn.title}
            disabled={mode === "preview"}
            className="p-1.5 rounded hover:bg-surface-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      {snippets && snippets.length > 0 && (
        <>
          <div className="w-px h-5 bg-surface-3 mx-1" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={mode === "preview"}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <LayoutTemplate className="h-4 w-4" />
                Blocos
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-surface-2 border-surface-3 text-foreground w-72"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {snippets.map((s) => (
                <DropdownMenuItem
                  key={s.label}
                  onSelect={() => setTimeout(() => insertBlock(s.content), 0)}
                  className="flex flex-col items-start gap-0.5 cursor-pointer focus:bg-surface-3"
                >
                  <span className="text-sm font-medium">{s.label}</span>
                  {s.description && (
                    <span className="text-[11px] text-muted-foreground">{s.description}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {preview && (
        <div className="ml-auto flex items-center rounded-md border border-surface-3 bg-surface-1 p-0.5">
          {(
            [
              { id: "edit", icon: PenLine, label: "Editar" },
              { id: "split", icon: Columns2, label: "Dividido" },
              { id: "preview", icon: Eye, label: "Prévia" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              title={m.label}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } ${m.id === "split" ? "hidden md:flex" : ""}`}
            >
              <m.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (!preview) {
    return (
      <div className="rounded-md border border-surface-3 bg-surface-2 overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-colors">
        {toolbar}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-foreground text-sm px-3 py-2.5 resize-y outline-none placeholder:text-muted-foreground/80"
          style={{ minHeight }}
        />
      </div>
    );
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div
      className="flex flex-col h-full rounded-md border border-surface-3 bg-surface-2 overflow-hidden focus-within:border-primary/50 transition-colors"
      style={{ minHeight }}
    >
      {toolbar}
      <div className="flex flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={() => syncScroll("editor")}
          onMouseEnter={() => (scrollSource.current = "editor")}
          onFocus={() => (scrollSource.current = "editor")}
          placeholder={placeholder}
          spellCheck
          className={`${mode === "preview" ? "hidden" : "block"} ${
            mode === "split" ? "w-1/2 border-r border-surface-3" : "w-full"
          } h-full bg-transparent text-foreground font-mono text-[13px] leading-relaxed px-4 py-3 resize-none outline-none placeholder:text-muted-foreground/80`}
        />
        <div
          ref={previewRef}
          onScroll={() => syncScroll("preview")}
          onMouseEnter={() => (scrollSource.current = "preview")}
          className={`${mode === "edit" ? "hidden" : "block"} ${
            mode === "split" ? "w-1/2" : "w-full"
          } h-full overflow-y-auto bg-surface-1 px-6 py-4`}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 select-none">
            Prévia · como o cliente verá
          </div>
          {value.trim() ? (
            <MarkdownPreview value={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">A prévia aparece aqui enquanto você digita.</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 border-t border-surface-3 text-[11px] text-muted-foreground">
        <span className="hidden sm:inline truncate">
          Enter continua listas e tabelas · Enter em item vazio sai da lista · Tab recua · Shift+Enter quebra linha simples
        </span>
        <span className="shrink-0">{words} palavras</span>
      </div>
    </div>
  );
}

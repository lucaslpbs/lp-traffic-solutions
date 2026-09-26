// Sanitizador minimo para o HTML do editor do Diario de Bordo (contentEditable).
// Mantem so formatacao basica; remove atributos (onerror, style, href...) e
// descarta tags perigosas por inteiro. Evita XSS armazenado quando o conteudo
// e gravado no banco e renderizado depois com dangerouslySetInnerHTML.

const PERMITIDAS = new Set([
  "B", "STRONG", "I", "EM", "U", "S", "UL", "OL", "LI",
  "H1", "H2", "H3", "P", "DIV", "BR", "BLOCKQUOTE",
]);

// Tags cujo conteudo tambem deve sumir (nao apenas a tag).
const DESCARTAR = new Set([
  "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "TEMPLATE",
  "SVG", "MATH", "FORM", "INPUT", "BUTTON", "TEXTAREA", "SELECT", "NOSCRIPT",
]);

function limpar(origem: Node, destino: Node, doc: Document) {
  origem.childNodes.forEach((no) => {
    if (no.nodeType === Node.TEXT_NODE) {
      destino.appendChild(doc.createTextNode(no.textContent ?? ""));
      return;
    }
    if (no.nodeType !== Node.ELEMENT_NODE) return;

    const el = no as Element;
    const tag = el.tagName.toUpperCase();
    if (DESCARTAR.has(tag)) return;

    if (PERMITIDAS.has(tag)) {
      const novo = doc.createElement(tag.toLowerCase());
      limpar(el, novo, doc);
      destino.appendChild(novo);
    } else {
      // Tag desconhecida: mantem so o texto/filhos permitidos dentro dela.
      limpar(el, destino, doc);
    }
  });
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const saida = doc.createElement("div");
  limpar(doc.body, saida, doc);
  return saida.innerHTML;
}

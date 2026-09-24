import { CURSOR_MARKER as C, type MarkdownSnippet } from "@/components/sistema/MarkdownEditor";

/** Blocos prontos para relatórios de otimização (usados no Sistema e no Checklist). */
export const OTIMIZACAO_SNIPPETS: MarkdownSnippet[] = [
  {
    label: "Campanha",
    description: "Título, nome e objetivo da campanha",
    content: `# CAMPANHA — ${C}\n\n**Nome da campanha:** \`[OBJETIVO] - \`\n\n**Objetivo:** \n`,
  },
  {
    label: "Conjunto de anúncios",
    description: "Nome do conjunto + tabela de configuração",
    content:
      `## Conjunto de anúncios\n\n**Nome:** \`${C}\`\n\n` +
      "| Configuração | Detalhe |\n|---|---|\n| **Destino** |  |\n| **Localização** |  |\n| **Idade** |  |\n| **Gênero** |  |\n| **Posicionamento** |  |\n| **Público** |  |\n",
  },
  {
    label: "Público / interesses",
    description: "Lista de interesses e comportamentos",
    content:
      `**Interesses e comportamentos:**\n\n- **Negócios:** ${C}\n` +
      "- **Moda:** \n- **Compras:** \n- **Comportamento:** \n",
  },
  {
    label: "Criativos",
    description: "Tabela de anúncios, formato e descrição",
    content: "## Criativos\n\n| Anúncio | Formato | Descrição |\n|---|---|---|\n|  |  |  |\n",
  },
  {
    label: "Pontos de atenção",
    description: "Lista numerada de sugestões e alertas",
    content: `# Pontos de atenção e sugestões\n\n1. **${C}:** \n`,
  },
  {
    label: "Resultados / métricas",
    description: "Tabela de métricas antes × depois",
    content:
      "## Resultados\n\n| Métrica | Antes | Depois |\n|---|---|---|\n| **Investimento** |  |  |\n| **CPM** |  |  |\n| **CTR** |  |  |\n| **Custo por resultado** |  |  |\n",
  },
  {
    label: "Próximos passos",
    description: "Checklist de ações",
    content: `## Próximos passos\n\n- [ ] ${C}\n`,
  },
  {
    label: "Divisor entre campanhas",
    content: "---\n",
  },
];

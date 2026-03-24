# Documentação do Dashboard – Traffic Solutions

## Visão Geral

O dashboard é uma aplicação React (TypeScript + Vite) que exibe métricas de campanhas do Meta Ads para os clientes da Traffic Solutions. A autenticação é feita via Supabase e os dados são obtidos através de webhooks N8N que consultam a API do Meta.

---

## Arquitetura Geral

```
Browser
  │
  ├── Login (Supabase Auth)
  │
  └── Dashboard
        ├── Lista de Clientes  →  webhook: bm-clientes-ativos
        ├── Relatório do Cliente  →  webhook: relatorio-meta-insights
        └── Quarto de Guerra  →  webhook: war-room + get-metrics + save-metrics
```

**Stack:**
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Recharts (gráficos)
- React Query (cache de dados)
- Supabase Auth
- N8N (orquestração de webhooks)
- html2pdf.js (exportação em PDF)

---

## Rotas

| Rota | Descrição | Proteção |
|------|-----------|----------|
| `/login` | Tela de login | Pública |
| `/dashboard` | Lista de clientes | Autenticada |
| `/dashboard/:clientId` | Relatório do cliente | Autenticada |
| `/dashboard/guerra` | Quarto de Guerra | Autenticada |

---

## Tela 1: Lista de Clientes (`/dashboard`)

### O que exibe

Grade de cards com todos os clientes ativos. Cada card mostra:
- Nome do cliente
- Foto/ícone da conta
- Quantidade de campanhas ativas

### KPIs do cabeçalho

| Métrica | Descrição |
|---------|-----------|
| **Total de Clientes** | Contagem de clientes ativos retornados pelo webhook |
| **Campanhas Ativas** | Soma das campanhas ativas de todos os clientes |
| **Relatórios Disponíveis** | Quantidade de relatórios disponíveis |

### Webhook utilizado

```
GET https://n8n.trafficsolutions.cloud/webhook/bm-clientes-ativos
```

**Resposta esperada:**
```json
{
  "total_clientes": 12,
  "campanhas_ativas": 38,
  "relatorios_disponiveis": 12,
  "clientes": [
    {
      "id_conta": "act_123456789",
      "nome": "Nome do Cliente",
      "campanhas_ativas": 3,
      "picture_url": "https://..."
    }
  ]
}
```

---

## Tela 2: Relatório do Cliente (`/dashboard/:clientId`)

O relatório é dividido em **duas abas**: **Mensagem** e **Site**, cada uma com foco em um tipo diferente de campanha.

### Como os dados são carregados

Ao abrir a página (ou mudar o filtro de datas), é feito um POST com o intervalo de datas e o ID do cliente:

```
POST https://n8n.trafficsolutions.cloud/webhook/relatorio-meta-insights
```

**Payload:**
```json
{
  "data_inicial": "01/03/2026",
  "data_final": "24/03/2026",
  "nome_cliente": "Nome do Cliente",
  "account_id": "act_123456789"
}
```

**Resposta (array de registros diários por conjunto de anúncios):**
```json
[
  {
    "nome_campanha": "Campanha X",
    "dia": "2026-03-01",
    "nome_conjunto_anuncios": "Conjunto Y",
    "alcance": 5200,
    "impressoes": 9800,
    "frequencia": 1.88,
    "valor_usado_brl": 120.50,
    "compras": 4,
    "custo_por_compra": 30.12,
    "valor_conversao_compra": 480.00,
    "cliques_link": 210,
    "cpc_clique_link": 0.57,
    "cliques_todos": 320,
    "cpc_todos": 0.37,
    "conversas_mensagem_iniciadas": 45,
    "custo_por_conversa_mensagem_iniciada": 2.67,
    "reproducoes_video_3s": 1500,
    "reproducoes_25": 800,
    "reproducoes_50": 600,
    "reproducoes_75": 400,
    "reproducoes_95": 200,
    "reproducoes_100": 100,
    "visitas_perfil_instagram": 90,
    "seguidores_instagram": 5,
    "custo_por_seguidor_instagram": 24.10,
    "ctr": 3.26,
    "cpm": 12.29,
    "visualizacoes_pagina_destino": 180,
    "finalizacoes_compra_iniciadas": 12,
    "adicionados_carrinho": 20
  }
]
```

Os dados são agrupados por dia no front-end para montar os gráficos e calcular os KPIs.

---

### Aba: Mensagem

Focada em campanhas de conversas (WhatsApp, Messenger, Instagram Direct).

#### KPIs – Linha 1

| Métrica | Fórmula | Formato |
|---------|---------|---------|
| **Valor Total Gasto** | `Σ valor_usado_brl` | R$ |
| **Total de Conversas** | `Σ conversas_mensagem_iniciadas` | Número |
| **Custo por Conversa** | `Valor Gasto / Total Conversas` | R$ |
| **Total de Compras** | `Σ compras` | Número |

#### KPIs – Linha 2

| Métrica | Fórmula | Formato |
|---------|---------|---------|
| **Impressões** | `Σ impressoes` | Número |
| **Alcance** | `Σ alcance` | Número |
| **CPM Médio** | `(Valor Gasto / Impressões) × 1000` | R$ |
| **CTR Médio** | `(Cliques Totais / Impressões) × 100` | % |

#### KPIs – Linha 3

| Métrica | Fórmula | Formato |
|---------|---------|---------|
| **Cliques Totais** | `Σ cliques_todos` | Número |
| **Cliques no Link** | `Σ cliques_link` | Número |
| **Visitas Instagram** | `Σ visitas_perfil_instagram` | Número |
| **Visualizações 3s** | `Σ reproducoes_video_3s` | Número |

#### Gráficos

| Gráfico | Tipo | Métricas |
|---------|------|---------|
| Valor Gasto por Dia | Área | `valor_usado_brl` |
| Conversas Iniciadas | Barras + Linha | `conversas` + `custo por conversa` |
| Impressões por Dia | Linha | `impressoes` |
| Cliques por Dia | Barras | `cliques_todos` |
| Visitas ao Instagram | Área | `visitas_perfil_instagram` |
| Visualizações de Vídeo (3s) | Barras | `reproducoes_video_3s` |

---

### Aba: Site

Focada em campanhas de e-commerce com funil de conversão.

#### Funil de Conversão

Exibe os passos em hierarquia visual com percentuais de conversão entre cada etapa:

```
Impressões
    │  CTR (%)
    ▼
Cliques no Link
    │  Connect Rate (%)
    ▼
Visualizações da Pág. de Destino
    │  Taxa de Checkout (%)
    ▼
Finalizações de Compra Iniciadas
    │
    ▼
Adicionados ao Carrinho
    │  Taxa de Compras (%)
    ▼
Compras
```

#### Métricas de Taxa (painel lateral)

| Métrica | Fórmula | Formato |
|---------|---------|---------|
| **CTR** | `(Cliques Totais / Impressões) × 100` | % |
| **Connect Rate** | `(Pág. Destino / Cliques no Link) × 100` | % |
| **Taxa de Checkout** | `(Checkouts / Pág. Destino) × 100` | % |
| **Taxa de Compras** | `(Compras / Checkouts) × 100` | % |
| **ROAS** | `Valor das Compras / Valor Gasto` | x |

#### Destaque de Receita

| Métrica | Fórmula |
|---------|---------|
| **Valor da Compra** | `Σ valor_conversao_compra` |
| **Ticket Médio** | `Valor da Compra / Total de Compras` |

#### Métricas do Período (painel superior)

| Métrica | Campo |
|---------|-------|
| Valor Usado | `valor_usado_brl` |
| Impressões | `impressoes` |
| Mensagens Iniciadas | `conversas_mensagem_iniciadas` |
| Visitas Instagram | `visitas_perfil_instagram` |
| Reproduções de Vídeo | `reproducoes_video_3s` |

#### Gráficos

| Gráfico | Tipo | Métricas |
|---------|------|---------|
| Funil Diário – Cliques vs Compras | Composto | `cliques_link` + `compras` |
| Valor Gasto por Dia | Área | `valor_usado_brl` |
| Custo por Compra | Linha | `custo_por_compra` |
| Adicionados ao Carrinho por Dia | Barras | `adicionados_carrinho` |

#### Tabela de Dados Diários

Colunas: Data | Valor Gasto | Impressões | Cliques no Link | Pág. Destino | Checkout | Carrinho | Compras | Receita | Custo/Compra

---

### Filtro de Datas e Exportação

- Seleção de intervalo de datas (início e fim)
- Atalhos: Hoje, Últimos 7 dias, Últimos 30 dias
- Exportar para PDF (com ou sem rótulos nos dados)

---

## Tela 3: Quarto de Guerra (`/dashboard/guerra`)

Monitoramento em tempo real de campanhas com alertas automáticos, comparações com período anterior e métricas configuráveis.

### Hierarquia de Dados

```
Cliente
  └── Campanha
        └── Conjunto de Anúncios
              └── Anúncio (com thumbnail do criativo)
```

### Webhooks utilizados

| Endpoint | Método | Parâmetros |
|----------|--------|------------|
| `war-room` | GET | `dateStart=yyyy-MM-dd&dateEnd=yyyy-MM-dd` |
| `get-metrics` | GET | Nenhum |
| `save-metrics` | POST | `{ clientId, metrics }` |

**Período atual:**
```
GET https://n8n.trafficsolutions.cloud/webhook/war-room?dateStart=2026-03-17&dateEnd=2026-03-24
```

**Período anterior** (para comparação): mesmo endpoint com datas recuadas.

---

### Métricas Disponíveis

| ID | Label | Unidade |
|----|-------|---------|
| `spend` | Gasto | R$ |
| `impressions` | Impressões | número |
| `reach` | Alcance | número |
| `clicks` | Cliques | número |
| `ctr` | CTR | % |
| `cpc` | CPC | R$ |
| `cpm` | CPM | R$ |
| `frequency` | Frequência | número |
| `roas` | ROAS | x |
| `conversas` | Conversas | número |
| `custo_conversa` | Custo/Conversa | R$ |
| `link_clicks` | Cliques no Link | número |
| `cplc` | CPC de Link | R$ |
| `ig_visits` | Visitas no IG | número |
| `video_p25` | Vídeo 25% | número |
| `video_p50` | Vídeo 50% | número |
| `video_p75` | Vídeo 75% | número |
| `video_p95` | Vídeo 95% | número |
| `video_p100` | Vídeo 100% | número |

---

### Sistema de Alertas

Cada métrica tem um **objetivo (goal)**, uma **direção** (maior é melhor ou menor é melhor) e duas **margens de desvio**:

```
direction: "lower"  → menor valor é melhor (ex: CPM, CPC, Custo/Conversa)
direction: "higher" → maior valor é melhor (ex: CTR, ROAS)
```

**Status visual:**

| Cor | Significado |
|-----|-------------|
| Verde | Dentro do objetivo |
| Amarelo | Desvio entre yellowMargin e redMargin |
| Vermelho | Desvio acima de redMargin (crítico) |
| Cinza | Sem dados |

**Configuração padrão das métricas:**

| Métrica | Goal | Direção | Amarelo | Vermelho |
|---------|------|---------|---------|---------|
| CPM | R$ 10 | lower | +15% | +30% |
| CTR | 2% | higher | -20% | -40% |
| CPC | R$ 1,50 | lower | +20% | +40% |
| ROAS | 3x | higher | -15% | -35% |

---

### Configuração de Métricas

As métricas podem ser configuradas em três níveis:

1. **Global** – aplica para todos os clientes e campanhas
2. **Por cliente** – sobrescreve o global para um cliente específico
3. **Por objetivo de campanha** – sobrescreve por cliente + objetivo (Engajamento, Tráfego, Vendas, Reconhecimento)

A configuração é salva e lida via webhook:

**Salvar:**
```
POST https://n8n.trafficsolutions.cloud/webhook/save-metrics

{
  "clientId": "global",             // ou "act_123456" ou "act_123456__vendas"
  "metrics": [
    {
      "id": "cpm",
      "label": "CPM",
      "unit": "R$",
      "goal": 10,
      "direction": "lower",
      "yellowMargin": 15,
      "redMargin": 30,
      "active": true
    }
  ]
}
```

**Ler:**
```
GET https://n8n.trafficsolutions.cloud/webhook/get-metrics
```

---

### Controles e Filtros

| Controle | Função |
|----------|--------|
| Preset de datas | Hoje / Últimos 7 dias / Últimos 15 dias / Últimos 30 dias / Personalizado |
| Filtro por cliente | Exibe apenas campanhas do cliente selecionado |
| Toggle "Apenas Alertas" | Mostra somente campanhas em estado amarelo ou vermelho |
| Seletor de Métricas | Ativa/desativa colunas, reordena e edita thresholds |
| Exportar CSV | Baixa os dados da tabela |

---

### Comparação com Período Anterior

Para cada métrica, é exibido um badge com a variação percentual em relação ao período anterior:

- **Verde com ▲** → melhora em relação ao período
- **Vermelho com ▼** → piora em relação ao período

O cálculo é: `((atual - anterior) / anterior) × 100`

A interpretação de melhora/piora leva em conta a `direction` da métrica (ex: CPM caindo é melhora, ROAS caindo é piora).

---

## Resumo dos Webhooks

| Endpoint | Método | Quem chama | Para que |
|----------|--------|------------|---------|
| `bm-clientes-ativos` | GET | Dashboard (lista) | Buscar clientes ativos e KPIs do cabeçalho |
| `relatorio-meta-insights` | POST | Relatório do cliente | Buscar dados diários de campanhas por cliente e período |
| `war-room` | GET | Quarto de Guerra | Buscar hierarquia completa (cliente → campanha → conjunto → anúncio) |
| `get-metrics` | GET | Quarto de Guerra | Ler configurações de métricas salvas |
| `save-metrics` | POST | Quarto de Guerra | Salvar configurações de métricas (global, por cliente, por objetivo) |

Todos os webhooks estão sob o domínio:
```
https://n8n.trafficsolutions.cloud/webhook/
```

---

## Autenticação

- Provider: **Supabase**
- Método: email + senha
- Sessão persistida via localStorage
- Rotas protegidas pelo componente `ProtectedRoute` – redireciona para `/login` se não autenticado

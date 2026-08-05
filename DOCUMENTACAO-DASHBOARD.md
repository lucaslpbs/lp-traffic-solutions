# Documentação do Dashboard – Traffic Solutions

## Visão Geral

O dashboard é uma aplicação React (TypeScript + Vite) que exibe métricas de campanhas do Meta Ads para os clientes da Traffic Solutions, além de um módulo administrativo de **Gestão de Clientes** (cadastro, contratos, cobrança e automações). A autenticação é feita via Supabase. Os dados de campanhas vêm de webhooks N8N que consultam a API do Meta, enquanto a Gestão de Clientes lê/grava diretamente em uma tabela Supabase dedicada e dispara webhooks N8N para acionar automações.

---

## Arquitetura Geral

```
Browser
  │
  ├── Login (Supabase Auth)
  │
  └── Dashboard
        ├── Lista de Clientes      →  webhook: bm-clientes-ativos
        ├── Relatório do Cliente   →  webhook: relatorio-meta-insights
        ├── Quarto de Guerra       →  webhook: war-room + get-metrics + save-metrics
        └── Gestão de Clientes     →  Supabase "Gestão" (tabela gestao_clientes)
                                       + webhooks: novo-cliente-cadastrado, cobrar-cliente
```

**Stack:**
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Recharts (gráficos)
- React Query (cache de dados)
- Supabase (Auth + projeto dedicado de Gestão de Clientes)
- N8N (orquestração de webhooks)
- html2pdf.js (exportação em PDF)

---

## Rotas

| Rota | Descrição | Proteção |
|------|-----------|----------|
| `/login` | Tela de login | Pública |
| `/dashboard` | Lista de clientes | Autenticada |
| `/dashboard/guerra` | Quarto de Guerra | Autenticada |
| `/dashboard/gestao-clientes` | Gestão de Clientes (cadastro, contratos, cobrança) | Autenticada |
| `/dashboard/:clientId` | Relatório do cliente | Autenticada |

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

## Tela 4: Gestão de Clientes (`/dashboard/gestao-clientes`)

Painel administrativo para cadastrar e gerenciar os contratos dos clientes da agência: dados de cobrança, WhatsApp, configurações de alerta do Meta Ads e o disparo das automações (fluxos N8N) de cada cliente. É a tela de **"criar clientes"**.

### Fonte de dados

Ao contrário das outras telas (que consultam webhooks N8N), a Gestão de Clientes lê e grava **diretamente em uma tabela do Supabase**, usando um projeto Supabase **separado** do projeto de autenticação:

```ts
// src/integrations/supabase/clientGestao.ts
export const supabaseGestao = createClient(
  import.meta.env.VITE_SUPABASE_GESTAO_URL,
  import.meta.env.VITE_SUPABASE_GESTAO_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
```

Toda a tela opera sobre a tabela `gestao_clientes`.

---

### KPIs do cabeçalho (Gestão de Clientes)

| KPI | Cálculo |
|-----|---------|
| **Total de Clientes** | `clientes.length` (todos os registros) |
| **Clientes Ativos** | quantidade com `status = 'ativo'` |
| **MRR Total** | soma de `valor_mensalidade` dos clientes ativos |
| **Vencendo esta semana** | clientes ativos cujo `dia_vencimento` está entre hoje e +7 dias (do dia do mês) |

---

### Filtros e busca

| Controle | Função |
|----------|--------|
| Busca | Filtra por `nome_cliente` ou `numero_conta_anuncio` (case-insensitive) |
| Status | Todos / Ativo / Pausado / Cancelado |
| Tipo de contrato | Todos / Semanal / Mensal / Trimestral / Semestral / Anual |

---

### Tabela de clientes

Colunas: `#`, Nome (+ segmento abaixo do nome), Conta Anúncio, WhatsApp, Valor, Vencimento, Status, Último Contato, Cobrança, Fluxos, Ações.

**Badges:**

| Badge | Valores | Origem |
|-------|---------|--------|
| Status | Ativo (verde) / Pausado (amarelo) / Cancelado (vermelho) | `status` |
| Cobrança | Enviada (verde) / Pendente (amarelo, default) / outro valor (cinza) | `status_cobranca` |
| Fluxos | "✓ Automações ativas" (azul) se `fluxos_criados = true`, senão "⏳ Aguardando" (amarelo) | `fluxos_criados` |

**Linha expandida** (ícone de olho/chevron): mostra ID do Grupo WhatsApp, Tipo de Contrato, Início do Contrato, Limite Mín. de Saldo, Responsável (se houver), Fim do Contrato (se houver), Observações (se houver) e se o **Webhook de cadastro foi disparado** (Sim/Não, de `webhook_cadastro_disparado`).

**Ações por linha:**

| Ícone | Ação |
|-------|------|
| Olho / Chevron (Eye/ChevronUp) | Expande/colapsa os detalhes da linha |
| Balão (MessageSquare) | Abre o modal "Confirmar Cobrança" |
| Lápis (Pencil) | Abre o modal de edição preenchido com os dados do cliente |
| Pausa / Play (PauseCircle/PlayCircle) | Alterna `status` entre `ativo` ⇄ `pausado` diretamente no Supabase |

---

### Modal "Novo Cliente" / "Editar Cliente"

Aberto pelo botão **"Novo Cliente"** (cabeçalho) ou pelo ícone de editar de uma linha. Dividido em 5 seções:

#### 1. Identificação

| Campo | Obrigatório | Observações |
|-------|:---:|---|
| Nome do Cliente | Sim | Texto livre. Ex: "Livet Indústria" |
| Nº Conta de Anúncio Meta | Sim | ID numérico da conta Meta Ads (ex: `705340254145484`) |
| Segmento | Não | Select: Saúde, Moda, Varejo, Educação, Serviços, Outro |
| Responsável Interno | Não | Texto livre |

#### 2. WhatsApp

| Campo | Obrigatório | Observações |
|-------|:---:|---|
| Nº WhatsApp do Cliente | Sim | Número pessoal do cliente, usado para **cobrança** (ex: `5585999999999`) |
| ID do Grupo WhatsApp | Sim | ID do grupo para onde vão alertas e relatórios automáticos (ex: `120363425141584579`). Obtido abrindo o grupo no WhatsApp Web e lendo o ID na URL |

#### 3. Contrato & Financeiro

| Campo | Obrigatório | Observações |
|-------|:---:|---|
| Valor da Mensalidade (R$) | Sim* | Editável normalmente. Se "Plano personalizado" estiver ativo, fica **somente leitura** e é preenchido automaticamente com o valor da 1ª parcela |
| Tipo de Contrato | Sim | Semanal / Mensal / Trimestral / Semestral / Anual |
| Plano de parcelas personalizado | Não | Toggle (switch) |
| Dia de Vencimento | Sim** | 1–31. **Não obrigatório para contrato Semanal** (assume `1` se vazio) |
| Data de Início | Sim | Default: data atual |
| Data de Fim | Não | Opcional |

**Plano de parcelas personalizado** (quando ativado):
- Mostra uma lista de "grupos de parcelas", cada um com: **Parcelas** (quantidade), **Valor R$**, **Início** (data).
- Botão **"Adicionar grupo de parcelas"** cria novos grupos; cada grupo (exceto o primeiro) pode ser removido.
- Uma **linha do tempo** é renderizada automaticamente abaixo, listando cada grupo (`Nx de R$Y — a partir de DD/MM/AAAA`) e o **total geral** (Σ parcelas × valor).
- O valor da 1ª parcela (`parcelas[0].valor`) alimenta automaticamente o campo "Valor da Mensalidade".

#### 4. Configurações Meta Ads

| Campo | Obrigatório | Observações |
|-------|:---:|---|
| Limite Mínimo de Saldo (R$) | Não (default `58.00`) | Quando o saldo da conta de anúncio cair abaixo deste valor, o alerta automático é disparado |

#### 5. Observações

Campo de texto livre (textarea), anotações internas.

---

### Validação ao salvar

O formulário bloqueia o envio (toast "Preencha todos os campos obrigatórios.") se faltar:
- `nome_cliente`
- `numero_conta_anuncio`
- `numero_whatsapp_cliente`
- `numero_grupo_whatsapp`
- valor da mensalidade (considera `parcelas[0].valor` se plano personalizado)
- `dia_vencimento` — **dispensado** se `tipo_contrato === 'semanal'`

---

### Fluxo: Cadastrar Novo Cliente

1. **Insert** na tabela `gestao_clientes` (Supabase – projeto Gestão), com o payload:

```ts
{
  nome_cliente, numero_conta_anuncio, segmento, responsavel_interno,
  numero_whatsapp_cliente, numero_grupo_whatsapp,
  valor_mensalidade,           // calculado: parcelas[0].valor se plano_personalizado, senão form.valor_mensalidade
  tipo_contrato,
  dia_vencimento,              // parseInt, default 1
  data_inicio, data_fim, observacoes,
  limite_minimo_saldo,         // default 58
  plano_personalizado,
  parcelas_detalhes,           // array de {parcelas, valor, inicio} se plano_personalizado, senão null
}
```

2. Se o insert tiver sucesso, dispara um **POST** para o webhook N8N:

```
POST https://n8n.trafficsolutions.cloud/webhook/novo-cliente-cadastrado
```

payload:

```json
{
  "action": "novo_cliente",
  "id": "<uuid do registro criado>",
  "timestamp": "2026-06-09T12:00:00.000Z",
  "clientName": "Nome do Cliente",
  "accountId": "705340254145484",
  "numero": "120363425141584579",
  "limiteMinimo": 58,
  "numero_whatsapp_cliente": "5585999999999",
  "valor_mensalidade": 1500,
  "dia_vencimento": 10,
  "tipo_contrato": "mensal",
  "data_inicio": "2026-06-09",
  "responsavel_interno": "...",
  "segmento": "...",
  "plano_personalizado": false,
  "parcelas_detalhes": null
}
```

> `numero` = ID do grupo de WhatsApp (não o número pessoal).

3. Se o webhook responder, o front atualiza `webhook_cadastro_disparado = true` no registro recém-criado. **Falha no webhook não bloqueia o cadastro** (é tratada silenciosamente, `catch` vazio).
4. Toast de sucesso: *"Cliente cadastrado! Os fluxos de automação serão criados em instantes."*
5. Modal fecha e a lista é recarregada (`fetchClientes`).

> O fluxo N8N `novo-cliente-cadastrado` é responsável por criar as automações do cliente (alerta de saldo mínimo, relatório diário no grupo, cobrança recorrente). Ao concluir, esse fluxo deve atualizar `fluxos_criados = true` na tabela — refletido no badge "✓ Automações ativas" da listagem.

---

### Fluxo: Editar Cliente

- Apenas um **update** na tabela `gestao_clientes` com o mesmo payload do cadastro (sem disparo de webhook).
- Toast: *"Cliente atualizado com sucesso!"*

---

### Fluxo: Ativar/Pausar

- Alterna `status` entre `'ativo'` e `'pausado'` com um update direto no Supabase.
- Toast: *"Cliente ativado."* ou *"Cliente pausado."*
- Não existe botão para `status = 'cancelado'` na UI — precisa ser feito via edição direta no banco.

---

### Fluxo: Cobrar Cliente

1. Clique no ícone de balão abre o modal **"Confirmar Cobrança"**, mostrando: nome do cliente, valor da mensalidade, dia de vencimento e número de WhatsApp.
2. Ao confirmar, **POST**:

```
POST https://n8n.trafficsolutions.cloud/webhook/cobrar-cliente
```

payload:

```json
{
  "action": "cobrar_cliente",
  "timestamp": "2026-06-09T12:00:00.000Z",
  "id": "<uuid>",
  "nome_cliente": "...",
  "numero_conta_anuncio": "...",
  "numero_whatsapp_cliente": "...",
  "numero_grupo_whatsapp": "...",
  "valor_mensalidade": 1500,
  "dia_vencimento": 10,
  "tipo_contrato": "mensal"
}
```

3. O fluxo N8N envia a mensagem de cobrança via WhatsApp para o número pessoal do cliente (`numero_whatsapp_cliente`).
4. Toast: *"Cobrança enviada para {nome} via WhatsApp!"*
5. Os campos `status_cobranca` e `ultimo_contato_cobranca` (exibidos na tabela) são atualizados pelo fluxo N8N após o envio.

---

### Tabela `gestao_clientes` (schema)

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `id` | uuid | `gen_random_uuid()` | Chave primária |
| `created_at` / `updated_at` | timestamptz | `now()` | Auditoria |
| `nome_cliente` | text | — | Nome do cliente |
| `numero_conta_anuncio` | text | — | ID da conta Meta Ads |
| `numero_whatsapp_cliente` | text | — | WhatsApp pessoal (cobrança) |
| `numero_grupo_whatsapp` | text | — | ID do grupo de alertas/relatórios |
| `valor_mensalidade` | numeric | — | Valor mensal do contrato |
| `tipo_contrato` | `semanal`\|`mensal`\|`trimestral`\|`semestral`\|`anual` | `mensal` | Periodicidade do contrato |
| `dia_vencimento` | integer | — | Dia do mês de vencimento |
| `limite_minimo_saldo` | numeric | `58` | Limite que dispara alerta de saldo no Meta Ads |
| `status` | `ativo`\|`pausado`\|`cancelado` | `ativo` | Status do contrato |
| `data_inicio` | date | — | Início do contrato |
| `data_fim` | date \| null | — | Fim do contrato (opcional) |
| `observacoes` | text \| null | — | Anotações internas |
| `responsavel_interno` | text \| null | — | Responsável pela conta |
| `segmento` | text \| null | — | Segmento de mercado |
| `webhook_cadastro_disparado` | boolean | — | Se o webhook `novo-cliente-cadastrado` já foi chamado com sucesso |
| `fluxos_criados` | boolean | — | Se as automações N8N do cliente já foram criadas |
| `ultimo_relatorio_enviado` | timestamptz \| null | — | Última vez que o relatório automático foi enviado |
| `plano_personalizado` | boolean | — | Se o contrato usa parcelas customizadas |
| `parcelas_detalhes` | jsonb \| null | — | Array de `{ parcelas, valor, inicio }` quando `plano_personalizado = true` |
| `status_cobranca` | text \| null | — | `pendente` (default) \| `enviada` \| outro |
| `ultimo_contato_cobranca` | timestamptz \| null | — | Data/hora da última cobrança enviada |

---

## Resumo dos Webhooks

| Endpoint | Método | Quem chama | Para que |
|----------|--------|------------|---------|
| `bm-clientes-ativos` | GET | Dashboard (lista) e Sidebar | Buscar clientes ativos e KPIs do cabeçalho |
| `relatorio-meta-insights` | POST | Relatório do cliente | Buscar dados diários de campanhas por cliente e período |
| `war-room` | GET | Quarto de Guerra | Buscar hierarquia completa (cliente → campanha → conjunto → anúncio) |
| `get-metrics` | GET | Quarto de Guerra | Ler configurações de métricas salvas |
| `save-metrics` | POST | Quarto de Guerra | Salvar configurações de métricas (global, por cliente, por objetivo) |
| `novo-cliente-cadastrado` | POST | Gestão de Clientes | Acionar criação das automações (alertas, relatórios, cobrança) de um cliente recém-cadastrado |
| `cobrar-cliente` | POST | Gestão de Clientes | Disparar mensagem de cobrança via WhatsApp para o cliente |

Todos os webhooks estão sob o domínio:

```text
https://n8n.trafficsolutions.cloud/webhook/
```

---

## Autenticação

- Provider: **Supabase**
- Método: email + senha
- Sessão persistida via localStorage
- Rotas protegidas pelo componente `ProtectedRoute` – redireciona para `/login` se não autenticado
- A **Gestão de Clientes** usa um **segundo projeto Supabase**, dedicado, acessado sem sessão (`persistSession: false`) — serve apenas como banco de dados (CRUD da tabela `gestao_clientes`), independente do projeto de autenticação do dashboard

import pilar1 from '../assets/pilar-1.jpeg';
import pilar2 from '../assets/pilar-2.jpeg';
import pilar3 from '../assets/pilar-3.jpeg';
import garantiaImg from '../assets/produto-garantia.jpeg';
import financiamentoImg from '../assets/produto-financiamento.jpeg';

export interface BlogPost {
  slug: string;
  categoria: string;
  titulo: string;
  resumo: string;
  capa: string;
  data: string;
  autor: string;
  tempoLeitura: string;
  corpo: string[];
}

// Conteúdo editorial fictício, produzido para fins de demonstração do site.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-funciona-home-equity',
    categoria: 'Educação Financeira',
    titulo: 'Como funciona o empréstimo com garantia de imóvel (Home Equity)',
    resumo:
      'Entenda passo a passo como transformar um imóvel quitado em crédito com taxas mais baixas e prazos mais longos que as linhas tradicionais.',
    capa: garantiaImg,
    data: '2026-06-02',
    autor: 'Equipe LPC Capital',
    tempoLeitura: '6 min de leitura',
    corpo: [
      'O empréstimo com garantia de imóvel, também conhecido como Home Equity, é uma modalidade de crédito em que você utiliza um imóvel quitado (ou parcialmente financiado) como garantia para obter recursos com condições muito mais vantajosas do que as linhas de crédito tradicionais, como o cheque especial ou o crédito pessoal sem garantia.',
      'Na prática, o imóvel continua sendo seu e você continua usando-o normalmente — a garantia só é acionada em caso de inadimplência prolongada, depois de esgotadas as tentativas de renegociação. Em troca dessa segurança oferecida ao credor, as taxas de juros caem drasticamente: enquanto o crédito pessoal comum pode ultrapassar 8% ao mês, o Home Equity costuma ficar na casa de 1% a 1,5% ao mês.',
      'O processo começa com uma avaliação do imóvel, que define o Loan to Value (LTV) — o percentual do valor do bem que pode ser liberado como crédito, geralmente entre 50% e 60%. Em seguida, é feita a análise de crédito e da documentação do imóvel (matrícula atualizada, certidões negativas, entre outros). Com tudo aprovado, o contrato é assinado em cartório e o valor é liberado, normalmente em até 30 dias.',
      'Por ser um crédito com prazos que podem chegar a 20 anos, as parcelas mensais tendem a caber melhor no orçamento, ainda que o custo total ao longo do tempo mereça ser sempre simulado com atenção. É exatamente para isso que existe um simulador: para você visualizar o impacto real de cada combinação de valor e prazo antes de tomar a decisão.',
    ],
  },
  {
    slug: 'sinais-para-recorrer-ao-home-equity',
    categoria: 'Planejamento',
    titulo: '5 sinais de que chegou a hora de recorrer ao crédito com garantia de imóvel',
    resumo:
      'Nem toda necessidade de crédito pede a mesma solução. Veja os cenários em que o Home Equity costuma ser a escolha mais inteligente.',
    capa: pilar1,
    data: '2026-06-14',
    autor: 'Equipe LPC Capital',
    tempoLeitura: '5 min de leitura',
    corpo: [
      'Muita gente só descobre o Home Equity depois de já ter contratado um crédito pessoal com juros bem mais altos. Para evitar esse erro, vale ficar atento a alguns sinais de que a garantia de imóvel pode ser o caminho mais barato e mais seguro.',
      '1. Você tem dívidas espalhadas em cartão de crédito e cheque especial. Consolidar tudo em uma única parcela, com uma taxa muito menor, costuma reduzir o custo total da dívida de forma significativa.',
      '2. Você precisa de um valor alto para investir no próprio negócio. Linhas de capital de giro sem garantia costumam ter juros elevados e prazos curtos — o Home Equity oferece mais fôlego para o investimento maturar.',
      '3. Você quer reformar ou ampliar o imóvel. Nesse caso, o próprio bem que está sendo valorizado serve como garantia do crédito usado na obra.',
      '4. Você tem um imóvel quitado "parado", sem gerar renda ou utilidade proporcional ao seu valor. Transformar parte desse patrimônio em liquidez, mantendo a posse do bem, é uma forma de fazer o capital trabalhar para você.',
      '5. Você já pesquisou outras linhas de crédito e sentiu que as taxas não cabem no seu planejamento. Antes de desistir, vale simular o Home Equity — a diferença de taxa costuma surpreender.',
    ],
  },
  {
    slug: 'home-equity-x-emprestimo-pessoal',
    categoria: 'Comparativo',
    titulo: 'Home Equity x Empréstimo Pessoal: qual escolher?',
    resumo:
      'Taxas, prazos, valores liberados e burocracia: comparamos as duas modalidades para ajudar você a decidir com mais clareza.',
    capa: pilar2,
    data: '2026-06-25',
    autor: 'Equipe LPC Capital',
    tempoLeitura: '7 min de leitura',
    corpo: [
      'À primeira vista, o empréstimo pessoal parece mais simples: sem garantia, sem burocracia, dinheiro na conta em poucos dias. Mas essa simplicidade tem um preço — literalmente. As taxas de juros do crédito pessoal sem garantia estão, em média, muito acima das praticadas no Home Equity.',
      'Em termos de valor, o empréstimo pessoal costuma ser limitado a alguns múltiplos da renda mensal comprovada, enquanto o Home Equity libera um percentual do valor do imóvel — o que, para bens de valor mais alto, representa acesso a quantias muito maiores.',
      'O prazo também muda o jogo: enquanto o crédito pessoal raramente ultrapassa 48 meses, o Home Equity pode se estender por até 20 anos, o que reduz consideravelmente o valor da parcela mensal, ainda que aumente o total de juros pagos ao longo do contrato — por isso a simulação prévia é essencial.',
      'Em resumo: para valores menores e necessidades pontuais e rápidas, o crédito pessoal ainda faz sentido. Já para valores mais altos, projetos de médio e longo prazo, ou consolidação de dívidas caras, o Home Equity tende a ser a alternativa financeiramente mais saudável — desde que o tomador esteja confortável em oferecer o imóvel como garantia.',
    ],
  },
  {
    slug: 'como-aumentar-chances-de-aprovacao',
    categoria: 'Dicas',
    titulo: 'Como aumentar suas chances de aprovação de crédito',
    resumo:
      'Pequenos ajustes na documentação e no perfil financeiro podem acelerar a análise e melhorar as condições oferecidas.',
    capa: pilar3,
    data: '2026-07-03',
    autor: 'Equipe LPC Capital',
    tempoLeitura: '5 min de leitura',
    corpo: [
      'A aprovação de um crédito com garantia de imóvel passa por duas frentes de análise: a do imóvel (documentação, matrícula, ônus e certidões) e a do tomador (renda, histórico de crédito e capacidade de pagamento). Organizar essas duas frentes com antecedência é o que mais acelera o processo.',
      'Do lado do imóvel, vale verificar se a matrícula está atualizada no cartório de registro de imóveis, se não há pendências como financiamentos ativos não informados, penhoras ou inventários em andamento. Documentos desatualizados são a principal causa de atraso na análise.',
      'Do lado pessoal, manter o CPF regular, evitar negativações recentes e comprovar renda de forma consistente (holerites, extratos, declaração de imposto de renda) fortalece o perfil. Para autônomos e empresários, ter a contabilidade organizada e o pró-labore formalizado também ajuda bastante.',
      'Por fim, trabalhar com uma plataforma que analisa seu perfil em mais de 30 instituições parceiras, como é o caso da LPC Capital, aumenta naturalmente as chances de aprovação: se um banco não aprovar ou não oferecer a melhor taxa, outro parceiro pode fazer sentido para o seu perfil.',
    ],
  },
  {
    slug: 'entenda-a-tabela-price',
    categoria: 'Educação Financeira',
    titulo: 'Taxas de juros: entenda como funciona a Tabela Price',
    resumo:
      'A maioria dos financiamentos no Brasil usa esse sistema de amortização. Veja como ele é calculado e por que a parcela é sempre fixa.',
    capa: financiamentoImg,
    data: '2026-07-10',
    autor: 'Equipe LPC Capital',
    tempoLeitura: '6 min de leitura',
    corpo: [
      'A Tabela Price, também chamada de sistema de amortização francês, é o método mais usado em financiamentos e empréstimos de longo prazo no Brasil — incluindo o crédito com garantia de imóvel. Sua principal característica é a parcela fixa: o valor pago todo mês é sempre o mesmo, do início ao fim do contrato.',
      'Isso é possível porque a composição da parcela muda ao longo do tempo: no começo, a maior parte do pagamento é destinada aos juros, e uma fatia menor amortiza o saldo devedor. Conforme o saldo diminui, a proporção se inverte — nas últimas parcelas, quase todo o valor pago vai para a amortização.',
      'A fórmula usada é PMT = PV × [ i × (1+i)ⁿ ] / [ (1+i)ⁿ − 1 ], em que PV é o valor solicitado, i é a taxa de juros mensal e n é o número de parcelas. É exatamente essa fórmula que roda por trás do nosso simulador — por isso, ao mover os controles de valor e prazo, você vê a parcela recalculada instantaneamente.',
      'Entender esse mecanismo ajuda a comparar propostas de forma mais consciente: duas simulações com a mesma parcela mensal podem ter custos totais bem diferentes, dependendo da taxa e do prazo. Por isso, olhar não só a parcela, mas também o total de juros pago no período, é essencial antes de fechar qualquer contrato.',
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

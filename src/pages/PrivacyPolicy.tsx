import { ShieldCheck, User, Eye } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-24 bg-gray-50 text-gray-800">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Política de Privacidade
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-700">
          A sua privacidade é importante para nós. Esta política descreve como tratamos os seus dados no site Automação n8n.
        </p>
      </div>

      {/* Última atualização */}
      <div className="text-sm text-gray-500 mb-6 text-center">
        Última atualização:{" "}
        <span className="font-medium">
          28/11/2025 20:18
        </span>
      </div>

      {/* Conteúdo */}
      <main className="space-y-8">

        <section>
          <h2 className="text-xl font-semibold mb-2">Informações Coletadas</h2>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos delas para fornecer um serviço.
            Fazemos isso por meios justos e legais, com seu conhecimento e consentimento.
            Também informamos por que estamos coletando e como esses dados serão usados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Armazenamento e Proteção</h2>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado.
            Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas,
            roubos, acesso indevido, divulgação, cópia, uso ou modificação não autorizados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Compartilhamento de Dados</h2>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros,
            exceto quando exigido por lei.
          </p>

          <p className="mt-4">
            Nosso site pode conter links para sites externos que não são operados por nós.
            Não temos controle sobre o conteúdo ou práticas desses sites e não nos responsabilizamos
            por suas políticas de privacidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Consentimento e Uso Continuado</h2>
          <p>
            Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que
            talvez não seja possível fornecer alguns dos serviços desejados.
            O uso continuado do site será considerado como aceitação das práticas descritas nesta política.
          </p>
          <p className="mt-4">
            Se tiver dúvidas sobre como lidamos com dados dos usuários, entre em contato conosco.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Google AdSense e Cookies</h2>
          <p>
            O serviço Google AdSense utiliza o cookie DoubleClick para fornecer anúncios mais relevantes
            e limitar o número de vezes que um anúncio aparece.
          </p>
          <p className="mt-4">
            Utilizamos anúncios para compensar custos de operação e financiar melhorias no site.
            Os cookies de publicidade comportamental garantem que você veja anúncios relevantes,
            rastreando anonimamente seus interesses.
          </p>
          <p className="mt-4">
            Parceiros afiliados também podem usar cookies para identificar se algum cliente chegou
            através de seus links, permitindo atribuição correta de comissões ou promoções aplicáveis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Compromisso do Usuário</h2>
          <p>O usuário se compromete a:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              Não se envolver em atividades ilegais ou contrárias à boa fé e à ordem pública.
            </li>
            <li>
              Não difundir propaganda ou conteúdo racista, xenofóbico, jogos de azar,
              pornografia ilegal, apologia ao terrorismo ou contra os direitos humanos.
            </li>
            <li>
              Não causar danos aos sistemas do Automação n8n, fornecedores ou terceiros,
              nem introduzir vírus ou softwares maliciosos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Mais Informações</h2>
          <p>
            Se não tiver certeza sobre a necessidade de determinado cookie,
            mantenha-o ativado — isso garantirá o funcionamento adequado dos recursos do site.
          </p>
          <p className="mt-4">
            Esta política é efetiva a partir de <strong>28 de Novembro de 2025 – 20:18</strong>.
          </p>
        </section>

      </main>

      {/* Rodapé */}
      <footer className="mt-10 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Automação n8n — Todos os direitos reservados.
      </footer>
    </div>
  );
}

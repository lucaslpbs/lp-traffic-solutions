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
          Sua privacidade é nossa prioridade. Esta página explica como coletamos,
          utilizamos, compartilhamos e protegemos seus dados em conformidade com a LGPD.
        </p>
      </div>

      {/* Última atualização */}
      <div className="text-sm text-gray-500 mb-6 text-center">
        Última atualização:{" "}
        <span className="font-medium">
          {new Date().toLocaleDateString("pt-BR")}
        </span>
      </div>

      {/* Sumário */}
      <nav
        className="flex flex-wrap gap-2 mb-10 justify-center"
        aria-label="Navegação nesta página"
      >
        {[
          "1. Informações que Coletamos",
          "2. Finalidades",
          "3. Bases Legais",
          "4. Compartilhamento",
          "5. Armazenamento e Segurança",
          "6. Direitos do Titular",
          "7. Cookies",
          "8. Alterações",
          "9. Contato",
        ].map((item, index) => (
          <a
            key={index}
            href={`#${index + 1}`}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Conteúdo */}
      <main className="space-y-8">
        <section id="1">
          <h2 className="text-xl font-semibold mb-2">1. Informações que Coletamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Dados de identificação</strong>: nome, e-mail, telefone, empresa.
            </li>
            <li>
              <strong>Dados técnicos/navegação</strong>: IP, geolocalização aproximada,
              dispositivo, navegador, páginas acessadas e cookies.
            </li>
            <li>
              <strong>Dados de campanhas e anúncios</strong>: métricas e informações de
              contas conectadas (Meta, Google Ads, etc.).
            </li>
            <li>
              <strong>Informações fornecidas diretamente</strong>: dados enviados via
              formulários, chat, landing pages ou e-mail.
            </li>
          </ul>
        </section>

        <section id="2">
          <h2 className="text-xl font-semibold mb-2">2. Finalidades do Uso</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Executar e otimizar campanhas de marketing e tráfego pago.</li>
            <li>Gerar relatórios de desempenho e realizar análises internas.</li>
            <li>Comunicação de suporte, propostas e informações relacionadas.</li>
            <li>Cumprimento de obrigações legais e regulatórias.</li>
            <li>Melhoria contínua dos serviços e personalização da experiência.</li>
          </ul>
        </section>

        <section id="3">
          <h2 className="text-xl font-semibold mb-2">3. Bases Legais</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Consentimento</strong> do titular quando aplicável.
            </li>
            <li>
              <strong>Execução de contrato</strong> ou procedimentos preliminares.
            </li>
            <li>
              <strong>Cumprimento de obrigação legal/regulatória</strong>.
            </li>
            <li>
              <strong>Legítimo interesse</strong> para atividades de marketing e prevenção
              à fraude.
            </li>
          </ul>
        </section>

        <section id="4">
          <h2 className="text-xl font-semibold mb-2">4. Compartilhamento de Informações</h2>
          <p>Poderemos compartilhar dados com:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Plataformas de mídia e analytics</strong> (Meta, Google, LinkedIn, etc.).
            </li>
            <li>
              <strong>Fornecedores e parceiros</strong> (hospedagem, CRM, e-mail marketing, automações, BI).
            </li>
            <li>
              <strong>Autoridades competentes</strong> quando exigido por lei.
            </li>
          </ul>
          <p>
            <strong>Não vendemos</strong> seus dados pessoais.
          </p>
        </section>

        <section id="5">
          <h2 className="text-xl font-semibold mb-2">5. Armazenamento e Segurança</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Medidas técnicas e administrativas: criptografia, controles de acesso e auditoria.</li>
            <li>Retenção pelo tempo necessário às finalidades ou conforme a lei.</li>
            <li>Transferências internacionais asseguradas com proteções adequadas.</li>
          </ul>
        </section>

        <section id="6">
          <h2 className="text-xl font-semibold mb-2">6. Direitos do Titular</h2>
          <p>Nos termos da LGPD, você pode:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acessar, corrigir ou atualizar seus dados.</li>
            <li>Solicitar exclusão, anonimização ou bloqueio.</li>
            <li>Solicitar portabilidade.</li>
            <li>Informações sobre compartilhamento e bases legais.</li>
            <li>Revogar consentimento.</li>
          </ul>
          <p>
            Para exercer seus direitos, envie um e-mail para{" "}
            <a
              href="mailto:lucaspaulinobs@gmail.com"
              className="text-blue-600 underline"
            >
              lucaspaulinobs@gmail.com
            </a>
            .
          </p>
        </section>

        <section id="7">
          <h2 className="text-xl font-semibold mb-2">7. Cookies e Tecnologias Semelhantes</h2>
          <p>
            Usamos cookies para funcionalidades do site, personalização e mensuração de
            campanhas. Você pode gerenciar cookies nas configurações do navegador.
          </p>
        </section>

        <section id="8">
          <h2 className="text-xl font-semibold mb-2">8. Alterações desta Política</h2>
          <p>
            Esta política pode ser atualizada a qualquer momento, com vigência a partir da
            publicação nesta página.
          </p>
        </section>

        <section id="9">
          <h2 className="text-xl font-semibold mb-2">9. Controlador e Contato</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Empresa:</strong> PGT GESTAO DE TRAFEGO LTDA
            </li>
            <li>
              <strong>CNPJ:</strong> 57.989.088/0001-33
            </li>
            <li>
              <strong>Endereço:</strong> Rua Monsenhor Bruno, 1153, Sala 1423, Aldeota, Fortaleza – CE, 60115-191
            </li>
            <li>
              <strong>E-mail DPO/Privacidade:</strong>{" "}
              <a
                href="mailto:lucaspaulinobs@gmail.com"
                className="text-blue-600 underline"
              >
                lucaspaulinobs@gmail.com
              </a>
            </li>
          </ul>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="mt-10 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Traffic Solutions — Todos os direitos reservados.
      </footer>
    </div>
  );
}

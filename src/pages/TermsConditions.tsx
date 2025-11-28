import { FileText, ShieldAlert, Link2 } from "lucide-react";

export function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-24 bg-gray-50 text-gray-800">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Termos de Serviço
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-700">
          Leia atentamente os termos que regem o uso do site Automação n8n.
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
          <h2 className="text-xl font-semibold mb-2">1. Termos</h2>
          <p>
            Ao acessar o site Automação n8n, você concorda em cumprir estes termos de serviço,
            todas as leis e regulamentos aplicáveis e reconhece que é responsável pelo cumprimento
            das leis locais. Caso não concorde com algum dos termos, o uso do site é proibido.
            Todos os materiais presentes são protegidos por direitos autorais e legislações vigentes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Uso de Licença</h2>
          <p>
            É concedida permissão temporária para baixar uma única cópia dos materiais do site
            exclusivamente para visualização pessoal e não comercial. Trata-se de uma licença —
            não uma transferência de propriedade. Você não pode:
          </p>

          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Modificar ou copiar os materiais.</li>
            <li>Usar o conteúdo para fins comerciais ou exibição pública.</li>
            <li>Descompilar, desmontar ou realizar engenharia reversa de software do site.</li>
            <li>Remover avisos de copyright ou propriedade.</li>
            <li>Transferir o conteúdo para terceiros ou espelhar materiais em outro servidor.</li>
          </ul>

          <p className="mt-4">
            A licença é encerrada automaticamente se houver violação e pode ser revogada a qualquer momento.
            Ao encerrar o uso, você deve apagar todos os arquivos baixados, físicos ou digitais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Isenção de Responsabilidade</h2>
          <p>
            Os materiais do Automação n8n são fornecidos “como estão”.
            Não oferecemos garantias expressas ou implícitas, incluindo garantias de comercialização,
            adequação a uma finalidade específica ou não violação de propriedade intelectual.
          </p>

          <p className="mt-4">
            Não garantimos precisão, resultados ou confiabilidade das informações exibidas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Limitações</h2>
          <p>
            Em nenhuma circunstância o Automação n8n ou seus fornecedores serão responsáveis por quaisquer danos,
            incluindo perdas de dados, lucros ou interrupção de negócios, decorrentes do uso ou incapacidade de uso
            dos materiais do site. Mesmo que notificados sobre a possibilidade de tais danos.
          </p>

          <p className="mt-4">
            Algumas jurisdições não permitem certas limitações; nesses casos, elas podem não se aplicar a você.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Precisão dos Materiais</h2>
          <p>
            O conteúdo exibido pode conter erros técnicos, tipográficos ou fotográficos.
            Não garantimos que qualquer material seja preciso, completo ou atualizado.
          </p>

          <p className="mt-4">
            Atualizações podem ocorrer a qualquer momento, sem aviso prévio,
            mas não assumimos obrigação de manter o conteúdo atualizado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Links</h2>
          <p>
            O Automação n8n não revisa todos os sites vinculados e não é responsável por conteúdos de terceiros.
            A presença de links não representa endosso. O acesso é por conta e risco do usuário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Modificações</h2>
          <p>
            Os termos podem ser alterados a qualquer momento, sem aviso. Ao continuar usando o site,
            você concorda com a versão vigente dos termos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis aplicáveis ao Automação n8n.
            Ao utilizar o site, você aceita a jurisdição exclusiva dos tribunais competentes dessa localidade.
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

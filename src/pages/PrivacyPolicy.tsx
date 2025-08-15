export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      <p className="mb-4">
        Sua privacidade é importante para nós. Esta política descreve como
        coletamos, usamos e protegemos suas informações pessoais quando você
        utiliza nosso site.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Coleta de Dados</h2>
      <p className="mb-4">
        Podemos coletar informações pessoais como nome, e-mail e telefone quando
        você preenche formulários de contato ou utiliza nossos serviços.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Uso das Informações</h2>
      <p className="mb-4">
        As informações coletadas são usadas apenas para comunicação, suporte e
        melhoria de nossos serviços.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Proteção de Dados</h2>
      <p className="mb-4">
        Utilizamos medidas de segurança adequadas para proteger suas informações
        pessoais contra acessos não autorizados.
      </p>

      <p className="mt-8">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}

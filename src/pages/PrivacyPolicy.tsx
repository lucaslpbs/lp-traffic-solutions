import { ShieldCheck, User, Eye } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">Política de Privacidade</h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          Sua privacidade é nossa prioridade. Aqui explicamos como coletamos, usamos e protegemos seus dados ao utilizar nosso site.
        </p>
      </div>

      {/* Seções */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Coleta de Dados */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-semibold text-blue-800">Coleta de Dados</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Coletamos informações como nome, e-mail e telefone quando você preenche formulários ou interage com nossos serviços.
          </p>
        </div>

        {/* Uso das Informações */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <Eye className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-semibold text-blue-800">Uso das Informações</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            As informações coletadas são utilizadas apenas para comunicação, suporte e melhoria contínua dos nossos serviços.
          </p>
        </div>

        {/* Proteção de Dados */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-semibold text-blue-800">Proteção de Dados</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Utilizamos medidas de segurança robustas para proteger suas informações pessoais contra acessos não autorizados.
          </p>
        </div>
      </div>

      {/* Rodapé da política */}
      <div className="mt-12 text-center text-gray-500">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </div>
    </div>
  );
}

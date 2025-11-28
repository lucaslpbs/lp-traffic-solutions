import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <p>
          © {new Date().getFullYear()} Traffic Solutions. Todos os direitos
          reservados.
        </p>
        <Link
          to="/privacidade"
          className="hover:text-primary underline mt-2 md:mt-0"
        >
          Política de Privacidade
        </Link>
        <Link
          to="/termos"
          className="hover:text-primary underline mt-2 md:mt-0"
        >
          Termos e condições
        </Link>
      </div>
    </footer>
  );
}

import { TextoLivreForm } from "./TextoLivreForm";

interface BibliotecaFormProps {
  clientId?: string;
  readOnly?: boolean;
}

export const BibliotecaForm = ({ clientId, readOnly = false }: BibliotecaFormProps) => (
  <TextoLivreForm
    clientId={clientId}
    secao="biblioteca"
    rotulo="a biblioteca de referências"
    titulo="Referências e materiais de estudo do cliente"
    placeholder="Cole links, anote insights, livros, podcasts, vídeos..."
    readOnly={readOnly}
  />
);

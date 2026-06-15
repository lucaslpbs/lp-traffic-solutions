import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Loader2, CheckCircle2, XCircle, MessageCircle } from "lucide-react";

type Status = "loading" | "qrcode" | "connected" | "error";

interface ConnectResponse {
  instanceToken: string;
  qrcode: string | null;
  alreadyConnected: boolean;
  error?: string;
}

interface StatusResponse {
  connected: boolean;
  qrcode?: string | null;
}

const WHATSAPP_GREEN = "#25D366";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_GESTAO_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_GESTAO_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
const SUPABASE_AUTH_HEADERS = {
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
};
const POLL_INTERVAL_MS = 3000;

const STEPS = [
  "Abra o WhatsApp no seu celular",
  "Toque em Mais opções (⋮) ou Configurações e selecione Aparelhos conectados",
  "Toque em Conectar um aparelho e aponte a câmera para este QR Code",
];

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 text-white">
      {children}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin" style={{ color: WHATSAPP_GREEN }} />
      <p className="text-white/70">Gerando QR Code…</p>
    </div>
  );
}

function QrCodeScreen({ qrcode }: { qrcode: string | null }) {
  return (
    <div className="w-full max-w-sm bg-[#161616] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5 shadow-2xl">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${WHATSAPP_GREEN}1A` }}
      >
        <MessageCircle className="w-7 h-7" style={{ color: WHATSAPP_GREEN }} />
      </div>

      <div className="bg-white rounded-xl p-3 flex items-center justify-center w-[226px] h-[226px]">
        {qrcode ? (
          <img src={qrcode} alt="QR Code de conexão" width={200} height={200} className="rounded-lg" />
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-black/30" />
        )}
      </div>

      <span
        className="text-xs font-medium px-3 py-1 rounded-full animate-pulse"
        style={{ backgroundColor: `${WHATSAPP_GREEN}1A`, color: WHATSAPP_GREEN }}
      >
        Aguardando escaneio
      </span>

      <ol className="w-full space-y-2 text-sm text-white/70">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-black"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            >
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-white/40 text-center">
        O QR Code expira em 2 minutos. Se expirar, recarregue a página para gerar um novo.
      </p>
    </div>
  );
}

function ConnectedScreen() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: `${WHATSAPP_GREEN}33` }}
        />
        <span
          className="relative inline-flex w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: `${WHATSAPP_GREEN}1A` }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: WHATSAPP_GREEN }} />
        </span>
      </div>
      <h1 className="text-xl font-semibold">Conectado!</h1>
      <p className="text-white/60 text-sm max-w-xs">Você já pode fechar esta janela.</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 max-w-sm">
      <XCircle className="w-12 h-12 text-red-500" />
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="text-white/60 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-lg font-semibold text-black transition-opacity hover:opacity-90"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default function CadastroInstancia() {
  const instanceName = new URLSearchParams(window.location.search).get("instance");
  const [status, setStatus] = useState<Status>("loading");
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (token: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `${FUNCTIONS_URL}/uazapi-status?token=${encodeURIComponent(token)}&instanceName=${encodeURIComponent(instanceName ?? "")}`,
            { headers: SUPABASE_AUTH_HEADERS }
          );
          if (!res.ok) return;
          const data: StatusResponse = await res.json();

          if (data.connected) {
            stopPolling();
            setStatus("connected");
            return;
          }

          if (data.qrcode) {
            setQrcode(data.qrcode);
          }
        } catch {
          // Ignora falhas pontuais do polling e tenta novamente no próximo ciclo
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  const connect = useCallback(async () => {
    if (!instanceName) return;

    setStatus("loading");
    setErrorMessage("");
    setQrcode(null);
    stopPolling();

    try {
      const res = await fetch(`${FUNCTIONS_URL}/uazapi-connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...SUPABASE_AUTH_HEADERS,
        },
        body: JSON.stringify({ instanceName }),
      });

      const data: ConnectResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível gerar o QR Code.");
      }

      if (data.alreadyConnected) {
        setStatus("connected");
        return;
      }

      setQrcode(data.qrcode);
      setStatus("qrcode");
      startPolling(data.instanceToken);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido ao conectar.");
      setStatus("error");
    }
  }, [instanceName, startPolling, stopPolling]);

  useEffect(() => {
    connect();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!instanceName) {
    return (
      <PageShell>
        <div className="flex flex-col items-center text-center gap-3">
          <XCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-xl font-semibold">Link inválido</h1>
          <p className="text-white/60 text-sm max-w-xs">
            Este link não contém as informações necessárias para conectar uma instância. Solicite um novo
            link.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {status === "loading" && <LoadingScreen />}
      {status === "qrcode" && <QrCodeScreen qrcode={qrcode} />}
      {status === "connected" && <ConnectedScreen />}
      {status === "error" && <ErrorScreen message={errorMessage} onRetry={connect} />}
    </PageShell>
  );
}

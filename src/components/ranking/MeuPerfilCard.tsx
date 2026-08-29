import { useRef, useState } from 'react';
import { Camera, Check, Loader2, Pencil, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadPerfilFoto, validateRankingImage } from '@/lib/rankingStorage';
import { formatBRL, formatDataBR, type PerfilRanking } from './types';

interface MeuPerfilCardProps {
  clientId: string;
  userId?: string;
  perfil: PerfilRanking | null;
  nomeCliente?: string | null;
  fotoRanking?: string | null;
  resumo: {
    posicao: number;
    total_vendido: number;
    qtd_vendas: number;
    maior_venda: number;
    ultima_venda: string | null;
  };
  posicaoTexto: string;
}

/**
 * Cartao "Meu Perfil" do ranking: foto, apelido editavel e resumo numerico.
 * Extraido da RankingPage, que concentrava esse bloco junto de outros cinco.
 */
export const MeuPerfilCard = ({
  clientId,
  userId,
  perfil,
  nomeCliente,
  fotoRanking,
  resumo,
  posicaoTexto,
}: MeuPerfilCardProps) => {
  const qc = useQueryClient();
  const fotoRef = useRef<HTMLInputElement>(null);
  const [editandoApelido, setEditandoApelido] = useState(false);
  const [apelido, setApelido] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const invalidarPerfil = () => {
    qc.invalidateQueries({ queryKey: ['ranking-perfil'] });
    qc.invalidateQueries({ queryKey: ['ranking-geral'] });
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;
    const erro = validateRankingImage(file);
    if (erro) {
      toast.error(erro);
      return;
    }
    setEnviandoFoto(true);
    try {
      const url = await uploadPerfilFoto(file, clientId);
      const { error } = await (supabase as any).from('ranking_perfis').upsert(
        {
          client_id: clientId,
          foto_url: url,
          apelido: perfil?.apelido ?? null,
          updated_by: userId ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      );
      if (error) throw error;
      toast.success('Foto de perfil atualizada');
      invalidarPerfil();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Erro ao enviar a foto');
    } finally {
      setEnviandoFoto(false);
      if (fotoRef.current) fotoRef.current.value = '';
    }
  };

  const salvarApelido = async () => {
    if (!clientId) return;
    const { error } = await (supabase as any).from('ranking_perfis').upsert(
      {
        client_id: clientId,
        apelido: apelido.trim() || null,
        foto_url: perfil?.foto_url ?? null,
        updated_by: userId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id' }
    );
    if (error) {
      toast.error('Erro ao salvar o apelido');
      return;
    }
    setEditandoApelido(false);
    toast.success('Perfil atualizado');
    invalidarPerfil();
  };

  const fotoAtual = perfil?.foto_url ?? fotoRanking ?? null;
  const nomeExibicao = perfil?.apelido || nomeCliente || 'Meu perfil';

  const linhas: [string, string][] = [
    ['Posição no ranking', posicaoTexto],
    ['Total vendido', formatBRL(resumo.total_vendido)],
    ['Qtd. de vendas', String(resumo.qtd_vendas)],
    ['Maior venda', formatBRL(resumo.maior_venda)],
    ['Última venda', formatDataBR(resumo.ultima_venda)],
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-5">Meu Perfil</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {fotoAtual ? (
            <img
              src={fotoAtual}
              alt={nomeExibicao}
              className="h-20 w-20 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-surface-2 border border-border flex items-center justify-center">
              <Building2 className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <input
            ref={fotoRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFoto}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fotoRef.current?.click()}
            disabled={enviandoFoto}
            aria-label="Enviar foto de perfil"
            title="Enviar foto de perfil"
            className="focus-ring absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-level-dark to-level p-2 text-primary-foreground shadow-lg shadow-level/30 hover:opacity-90 transition-opacity"
          >
            {enviandoFoto ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {editandoApelido ? (
            <div className="flex items-center gap-2">
              <Input
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Como quer aparecer"
                className="h-9"
                autoFocus
              />
              <Button
                size="icon"
                onClick={salvarApelido}
                aria-label="Salvar apelido"
                className="h-9 w-9 bg-level text-primary-foreground hover:brightness-110"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setApelido(perfil?.apelido ?? '');
                setEditandoApelido(true);
              }}
              aria-label="Editar apelido"
              className="focus-ring group flex items-center gap-2 text-left rounded max-w-full"
            >
              <span className="text-xl font-bold text-level truncate">{nomeExibicao}</span>
              <Pencil className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/80 group-hover:text-foreground/85" />
            </button>
          )}
          <p className="text-sm text-muted-foreground truncate">{nomeCliente}</p>
        </div>
      </div>

      <dl className="space-y-3 text-sm">
        {linhas.map(([label, valor]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold text-foreground tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

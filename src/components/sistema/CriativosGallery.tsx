import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image as ImageIcon, Loader2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdVideoModal } from '@/components/war-room/AdVideoModal';
import { AdNode, buildWarRoomUrl, getCurrentPeriodDates } from '@/types/war-room';

interface Props {
  clientId?: string;
}

function collectActiveAds(nodes: AdNode[]): AdNode[] {
  const result: AdNode[] = [];
  const walk = (n: AdNode) => {
    if (n.type === 'ad') {
      if (n.status === 'ACTIVE') result.push(n);
      return;
    }
    n.children?.forEach(walk);
  };
  nodes.forEach(walk);
  return result;
}

export const CriativosGallery = ({ clientId }: Props) => {
  const { data: clienteInfo } = useQuery({
    queryKey: ['criativos-cliente-info', clientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('gestao_clientes')
        .select('nome_cliente, numero_conta_anuncio')
        .eq('id', clientId!)
        .single();
      return data as { nome_cliente: string; numero_conta_anuncio: string | null } | null;
    },
    enabled: !!clientId,
  });

  const accountId = clienteInfo?.numero_conta_anuncio ?? null;
  const clientName = clienteInfo?.nome_cliente ?? '';

  const { data: ads, isLoading } = useQuery({
    queryKey: ['criativos-ativos', accountId, clientName],
    queryFn: async () => {
      const { start, end } = getCurrentPeriodDates({ preset: 'last_30d' });
      const res = await fetch(buildWarRoomUrl(start, end));
      if (!res.ok) throw new Error('Erro ao buscar criativos');
      const allClients: AdNode[] = await res.json();
      const clientNode = allClients.find(c =>
        (accountId && c.id === accountId) ||
        c.name?.trim().toLowerCase() === clientName.trim().toLowerCase()
      );
      if (!clientNode) return [];
      return collectActiveAds([clientNode]);
    },
    enabled: !!clienteInfo,
  });

  const [selectedAd, setSelectedAd] = useState<AdNode | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center">
        <ImageIcon className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400">Nenhum criativo ativo no momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ads.map(ad => {
          const thumb = ad.creative?.thumbnailUrl || ad.creative?.imageUrl;
          const hasVideo = !!ad.creative?.instagramPermalinkUrl || !!ad.creative?.videoId;
          return (
            <button
              key={ad.id}
              type="button"
              onClick={() => setSelectedAd(ad)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:border-[#3b82f6]/50 transition-all"
            >
              {thumb ? (
                <img src={thumb} alt={ad.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                {hasVideo && (
                  <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                )}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                <p className="text-xs text-white truncate text-left">{ad.name}</p>
              </div>
            </button>
          );
        })}
      </div>
      <AdVideoModal ad={selectedAd} onOpenChange={open => { if (!open) setSelectedAd(null); }} />
    </>
  );
};

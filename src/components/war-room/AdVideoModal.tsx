import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AdNode } from '@/types/war-room';

interface Props {
  ad: AdNode | null;
  onOpenChange: (open: boolean) => void;
}

function toEmbedUrl(permalink: string): string {
  const clean = permalink.endsWith('/') ? permalink : `${permalink}/`;
  return `${clean}embed`;
}

export const AdVideoModal = ({ ad, onOpenChange }: Props) => {
  const permalink = ad?.creative?.instagramPermalinkUrl;
  const imageUrl = ad?.creative?.imageUrl;

  return (
    <Dialog open={!!ad} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[400px] w-[400px] p-0 bg-black border-white/10 overflow-hidden [&>button]:text-white [&>button]:bg-black/40 [&>button]:rounded-full [&>button]:p-1 [&>button]:z-10"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{ad?.name ?? 'Anúncio'}</DialogTitle>
        {permalink ? (
          <iframe
            key={permalink}
            src={toEmbedUrl(permalink)}
            className="w-full h-[620px] border-0 bg-white"
            allow="autoplay; encrypted-media"
            allowFullScreen
            scrolling="no"
            title={ad?.name ?? 'Anúncio'}
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt={ad?.name ?? ''} className="w-full h-auto max-h-[80vh] object-contain" />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Mídia não disponível para este anúncio.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

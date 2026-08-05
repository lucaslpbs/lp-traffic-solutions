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

  return (
    <Dialog open={!!ad} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[400px] w-[400px] p-0 bg-black border-white/10 overflow-hidden [&>button]:text-white [&>button]:bg-black/40 [&>button]:rounded-full [&>button]:p-1 [&>button]:z-10"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{ad?.name ?? 'Vídeo do anúncio'}</DialogTitle>
        {permalink ? (
          <iframe
            key={permalink}
            src={toEmbedUrl(permalink)}
            className="w-full h-[620px] border-0 bg-white"
            allow="autoplay; encrypted-media"
            allowFullScreen
            scrolling="no"
            title={ad?.name ?? 'Vídeo do anúncio'}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Vídeo não disponível para este anúncio.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

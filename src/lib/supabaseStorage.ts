import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'client-logos';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export function validateLogoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato não suportado. Use JPG, PNG, WebP ou SVG.';
  }
  if (file.size > MAX_SIZE) {
    return 'Arquivo muito grande. Máximo permitido: 5MB.';
  }
  return null;
}

export async function uploadClientLogo(file: File, clientId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${clientId}/logo.${ext}`;

  const { data: existing } = await (supabase as any).storage
    .from(BUCKET)
    .list(clientId);

  if (existing?.length) {
    await (supabase as any).storage
      .from(BUCKET)
      .remove(existing.map((f: any) => `${clientId}/${f.name}`));
  }

  const { error } = await (supabase as any).storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = (supabase as any).storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

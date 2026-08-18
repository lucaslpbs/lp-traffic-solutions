import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'ranking';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateRankingImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato não suportado. Use PNG, JPG ou WebP.';
  }
  if (file.size > MAX_SIZE) {
    return 'Arquivo muito grande. Máximo permitido: 5MB.';
  }
  return null;
}

function extOf(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'png';
}

/** Print da venda — fica em ranking/<client_id>/vendas/<timestamp>.png */
export async function uploadVendaPrint(file: File, clientId: string): Promise<string> {
  const path = `${clientId}/vendas/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extOf(file)}`;

  const { error } = await (supabase as any).storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = (supabase as any).storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Foto de perfil do cliente no ranking — ranking/<client_id>/perfil.<ext> */
export async function uploadPerfilFoto(file: File, clientId: string): Promise<string> {
  const path = `${clientId}/perfil-${Date.now()}.${extOf(file)}`;

  const { error } = await (supabase as any).storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = (supabase as any).storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

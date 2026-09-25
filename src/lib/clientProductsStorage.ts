import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'client-products';
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateProductImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato não suportado. Use JPG, PNG ou WebP.';
  }
  if (file.size > MAX_SIZE) {
    return 'Arquivo muito grande. Máximo permitido: 5MB.';
  }
  return null;
}

export interface UploadedProductImage {
  storagePath: string;
  publicUrl: string;
}

/**
 * crypto.randomUUID() só existe em contexto seguro (HTTPS ou localhost) —
 * em HTTP puro a função nem é exposta. getRandomValues() não tem essa
 * restrição, e como fallback final basta um nome de arquivo único (não
 * precisa ser criptograficamente forte).
 */
function generateFileId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  if (c?.getRandomValues) {
    const bytes = c.getRandomValues(new Uint8Array(16));
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/** Caminho do objeto e {clientId}/{productId}/... — as RLS policies do bucket conferem o dono pelo primeiro segmento. */
export async function uploadProductImage(
  file: File,
  clientId: string,
  productId: string
): Promise<UploadedProductImage> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${clientId}/${productId}/${generateFileId()}.${ext}`;

  const { error } = await (supabase as any).storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type });
  if (error) throw error;

  const { data } = (supabase as any).storage.from(BUCKET).getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}

export async function removeProductImages(storagePaths: string[]): Promise<void> {
  if (storagePaths.length === 0) return;
  await (supabase as any).storage.from(BUCKET).remove(storagePaths);
}

/**
 * Exclusao total de um produto: apaga os caminhos gravados no banco e tambem
 * qualquer sobra na pasta {clientId}/{productId}/ (upload que falhou no meio
 * de uma edicao, por exemplo). Ao contrario de removeProductImages, propaga o
 * erro para o chamador poder avisar que ficou lixo no bucket.
 */
export async function removeProductFolder(
  clientId: string,
  productId: string,
  knownPaths: string[] = []
): Promise<void> {
  const folder = `${clientId}/${productId}`;
  // Se a listagem falhar, ainda apagamos os caminhos que ja conhecemos.
  const { data: listed } = await (supabase as any).storage.from(BUCKET).list(folder, { limit: 1000 });
  const paths = new Set<string>([
    ...knownPaths,
    ...((listed ?? []) as { name: string }[]).map((f) => `${folder}/${f.name}`),
  ]);
  if (paths.size === 0) return;

  const { error } = await (supabase as any).storage.from(BUCKET).remove([...paths]);
  if (error) throw error;
}

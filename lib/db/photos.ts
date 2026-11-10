// Listing photos in Supabase Storage (story 8). Public bucket "listing-photos" (migration 0003, DECISIONS · story 8):
// the browser reduces each photo first; this server code uploads it with the server key.
import { db } from "./client";
import { photoTooBig } from "@/lib/rules/sellForm";

const BUCKET = "listing-photos";
export type PhotoKind = "cover" | "record" | "matrix";

// The photo sent in a form field, or null if there is none or it is not a usable image (empty, not an image,
// above the size limit of story 8). Used by the sell form and by the edit in My listings.
export function photoFromForm(form: FormData, name: string): File | null {
  const value = form.get(name);
  return value instanceof File && value.size > 0 && value.type.startsWith("image/") && !photoTooBig(value.size) ? value : null;
}

// Uploads one photo and returns its public link. Throws if the upload fails.
export async function uploadListingPhoto(sellerId: string, kind: PhotoKind, file: File): Promise<string> {
  const path = `${sellerId}/${crypto.randomUUID()}-${kind}.jpg`;
  const storage = db().storage.from(BUCKET);
  const { error } = await storage.upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(`Could not upload the ${kind} photo: ${error.message}`);
  return storage.getPublicUrl(path).data.publicUrl;
}

// Removes photos uploaded for a listing that was not created, so no orphan files stay behind. Never throws.
export async function removeListingPhotos(urls: string[]): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const paths = urls.map((u) => u.split(marker)[1]).filter(Boolean);
  if (paths.length > 0) await db().storage.from(BUCKET).remove(paths).catch(() => undefined);
}

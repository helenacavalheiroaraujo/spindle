// Photo viewer on the listing check screen (bug 13): which photos the viewer shows and how the arrows move.
// Pure functions, no database. Photos that do not exist are left out (the screen says "No matrix photo" itself).
export type PhotoKind = "cover" | "record" | "matrix";
export type PhotoSet = Record<PhotoKind, string | null>;
export type ViewerPhoto = { kind: PhotoKind; src: string };

const ORDER: PhotoKind[] = ["cover", "record", "matrix"];

// The photos that exist, in the order cover, record, matrix.
export function viewerPhotos(photos: PhotoSet): ViewerPhoto[] {
  return ORDER.flatMap((kind) => (photos[kind] ? [{ kind, src: photos[kind] as string }] : []));
}

// The photo after moving one step (delta -1 or +1). It stops at the first and the last photo.
export function stepPhoto(index: number, delta: -1 | 1, count: number): number {
  return Math.min(Math.max(index + delta, 0), count - 1);
}

// "Record · 2 of 3" (position is 0-based).
export function viewerLabel(kind: PhotoKind, index: number, count: number): string {
  return `${kind[0].toUpperCase()}${kind.slice(1)} · ${index + 1} of ${count}`;
}

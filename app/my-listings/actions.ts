"use server";
// My listings (story 8 · use cases 4–6, bug 10): edit price, condition and photos, remove, undo.
// The rules are checked again here: the browser could send anything.
import { getSellerProfile } from "@/lib/db/profiles";
import {
  getListingPhotos,
  removeListing,
  undoRemoveListing,
  updateListingDetails,
  type ListingChange,
} from "@/lib/db/listings";
import { photoFromForm, removeListingPhotos, uploadListingPhoto } from "@/lib/db/photos";
import { currentUser } from "@/lib/db/session";
import { canSaveEdit, checkPrice, isCondition } from "@/lib/rules/sellForm";

// "failed": anything unexpected (signed out meanwhile, connection, a photo that could not be uploaded): the error
// screen with "Try again".
export type ChangeResult = ListingChange | "invalid" | "failed";

async function asSeller(change: (sellerId: string) => Promise<ListingChange>): Promise<ChangeResult> {
  try {
    const user = await currentUser();
    if (!user) return "failed";
    const profile = await getSellerProfile(user.id, user.name);
    if (!profile) return "failed";
    return await change(profile.id);
  } catch {
    return "failed";
  }
}

// "Save changes": condition, price and any new photos, in one update. A photo that is not sent stays as it is.
// The version never changes. If anything fails, nothing is changed and the photos just uploaded are deleted;
// after a change, the files of the replaced photos are deleted.
export async function saveChanges(listingId: string, form: FormData): Promise<ChangeResult> {
  const condition = String(form.get("condition") ?? "");
  const typedPrice = String(form.get("price") ?? "");
  const price = checkPrice(typedPrice);
  const newPhotos = {
    cover: photoFromForm(form, "cover"),
    record: photoFromForm(form, "record"),
    matrix: photoFromForm(form, "matrix"),
  };

  const uploaded: string[] = [];
  let changed = false;
  try {
    const user = await currentUser();
    if (!user) return "failed";
    const profile = await getSellerProfile(user.id, user.name);
    if (!profile) return "failed";
    const saved = await getListingPhotos(profile.id, listingId);
    if (!saved) return "not_found";
    const input = {
      condition,
      price: typedPrice,
      hasCover: !!newPhotos.cover || saved.cover !== null,
      hasRecord: !!newPhotos.record || saved.record !== null,
    };
    if (!canSaveEdit(input) || !price.ok || !isCondition(condition)) return "invalid";

    const urls: { cover?: string; record?: string; matrix?: string } = {};
    for (const kind of ["cover", "record", "matrix"] as const) {
      const file = newPhotos[kind];
      if (!file) continue;
      urls[kind] = await uploadListingPhoto(profile.id, kind, file);
      uploaded.push(urls[kind]);
    }
    const result = await updateListingDetails(profile.id, listingId, { price: price.price, conditionCode: condition, photos: urls });
    if (result !== "ok") return result;
    changed = true;
    await removeListingPhotos(
      [urls.cover && saved.cover, urls.record && saved.record, urls.matrix && saved.matrix].filter((u): u is string => !!u),
    );
    return "ok";
  } catch {
    return "failed";
  } finally {
    if (!changed) await removeListingPhotos(uploaded);
  }
}

export async function remove(listingId: string): Promise<ChangeResult> {
  return asSeller((sellerId) => removeListing(sellerId, listingId));
}

export async function undoRemove(listingId: string): Promise<ChangeResult> {
  return asSeller((sellerId) => undoRemoveListing(sellerId, listingId));
}

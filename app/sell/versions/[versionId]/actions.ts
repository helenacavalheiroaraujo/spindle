"use server";
// "List for sale" (story 8 · use case 2). The rules in lib/rules/sellForm are checked again here:
// the browser could send anything.
import { redirect } from "next/navigation";
import { createListing } from "@/lib/db/listings";
import { photoFromForm, removeListingPhotos, uploadListingPhoto } from "@/lib/db/photos";
import { getSellerProfile } from "@/lib/db/profiles";
import { currentUser } from "@/lib/db/session";
import { withReturn } from "@/lib/rules/login";
import { canList, checkPrice, isCondition } from "@/lib/rules/sellForm";

// "not_in_catalogue": "This version isn't in our catalogue yet". "upload_failed": the photos could not be saved.
// "failed": anything else. In every case nothing was created and the form keeps what was typed.
export type PublishState = { status: "ready" | "not_in_catalogue" | "upload_failed" | "failed" };

export async function publish(versionId: string, _prev: PublishState, form: FormData): Promise<PublishState> {
  const user = await currentUser().catch(() => undefined);
  if (user === undefined) return { status: "failed" };
  if (user === null) redirect(withReturn("/login", `/sell/versions/${versionId}`)); // session ended meanwhile

  const condition = String(form.get("condition") ?? "");
  const price = checkPrice(String(form.get("price") ?? ""));
  const city = String(form.get("city") ?? "");
  const shopName = String(form.get("shopName") ?? "");
  const cover = photoFromForm(form, "cover");
  const record = photoFromForm(form, "record");
  const matrix = photoFromForm(form, "matrix");

  const uploaded: string[] = [];
  let ok = false;
  try {
    const profile = await getSellerProfile(user.id, user.name);
    if (!profile) return { status: "failed" };
    const input = { condition, price: String(form.get("price") ?? ""), hasCover: !!cover, hasRecord: !!record, city };
    if (!canList(input) || !price.ok || !isCondition(condition) || !cover || !record) return { status: "failed" };

    let photos: { cover: string; record: string; matrix: string | null };
    try {
      const upload = async (kind: "cover" | "record" | "matrix", file: File) => {
        const url = await uploadListingPhoto(profile.id, kind, file);
        uploaded.push(url);
        return url;
      };
      photos = {
        cover: await upload("cover", cover),
        record: await upload("record", record),
        matrix: matrix ? await upload("matrix", matrix) : null,
      };
    } catch {
      return { status: "upload_failed" };
    }

    const result = await createListing({
      sellerId: profile.id,
      versionId,
      conditionCode: condition,
      price: price.price,
      photos,
      city, // where this listing is sold from (bug 11); the profile keeps only the first one
      shopName,
    });
    if ("error" in result) return { status: result.error === "version_not_found" ? "not_in_catalogue" : "failed" };
    ok = true;
  } catch {
    return { status: "failed" };
  } finally {
    if (!ok) await removeListingPhotos(uploaded);
  }
  // The new listing appears under the chosen version, yellow (story 8 · use case 2).
  redirect(`/versions/${versionId}/listings`);
}

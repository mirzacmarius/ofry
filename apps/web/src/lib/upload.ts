import type { Id } from "@ofry/backend/convex/_generated/dataModel";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Uploads one image to Convex storage and returns its id. Throws a readable error. */
export async function uploadImage(file: File, generateUploadUrl: () => Promise<string>): Promise<Id<"_storage">> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} nu este o imagine.`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name} depășește 8 MB.`);
  const url = await generateUploadUrl();
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
  if (!res.ok) throw new Error("Încărcarea a eșuat.");
  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
  return storageId;
}

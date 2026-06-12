import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicEvents() {
  revalidateTag("public-events");
  revalidatePath("/calendar");
  revalidatePath("/events");
}

export function revalidatePublicClubs() {
  revalidateTag("public-clubs");
  revalidatePath("/clubs");
}

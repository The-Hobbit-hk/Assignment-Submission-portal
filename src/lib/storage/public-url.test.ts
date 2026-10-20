import assert from "node:assert/strict";
import test from "node:test";
import { publicFileUrl, resolveStoredFileUrl, rewriteFileUrls, uploadsKeyFromStoredUrl } from "./public-url";

const oldUrl =
  "https://xtojaphqdxdrrodskqar.supabase.co/storage/v1/object/public/uploads/events/minutes/club/file.pdf";

test("a stored Supabase uploads URL becomes the same R2 object key", () => {
  assert.equal(uploadsKeyFromStoredUrl(oldUrl), "events/minutes/club/file.pdf");
  assert.equal(uploadsKeyFromStoredUrl("https://example.com/file.pdf"), null);
  assert.equal(uploadsKeyFromStoredUrl(`${oldUrl.split("/uploads/")[0]}/uploads/../secret.pdf`), null);
});

test("existing file links are served from this site until a public R2 domain is set", () => {
  delete process.env.R2_PUBLIC_BASE_URL;
  assert.equal(resolveStoredFileUrl(oldUrl), "/api/storage/public/events/minutes/club/file.pdf");
  assert.equal(resolveStoredFileUrl("https://forms.gle/keep"), "https://forms.gle/keep");
  assert.equal(publicFileUrl("events/banners/a.jpg"), "/api/storage/public/events/banners/a.jpg");
});

test("nested records and external links are rewritten only for archive URLs", () => {
  const result = rewriteFileUrls({
    bannerUrl: oldUrl,
    registrationUrl: "https://forms.gle/keep",
    proofUrls: [oldUrl],
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
  });
  assert.equal(result.bannerUrl, "/api/storage/public/events/minutes/club/file.pdf");
  assert.equal(result.registrationUrl, "https://forms.gle/keep");
  assert.equal(result.proofUrls[0], "/api/storage/public/events/minutes/club/file.pdf");
  assert.equal(result.createdAt.toISOString(), "2026-10-01T00:00:00.000Z");
});

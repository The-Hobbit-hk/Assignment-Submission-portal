import assert from "node:assert/strict";
import test from "node:test";
import {
  canStart,
  classifyStoredValue,
  decideObject,
  quotaDecision,
  referenceRewriteAllowed,
  rewriteJsonSelective,
  rewriteJsonValue,
  rollbackAction,
  selectWithinQuota,
} from "./plan";

const oldPdf =
  "https://xtojaphqdxdrrodskqar.supabase.co/storage/v1/object/public/uploads/events/minutes/club/file.pdf";

test("public uploads URLs on the old project rewrite to the new project", () => {
  const classified = classifyStoredValue(oldPdf, "url");
  assert.equal(classified.kind, "old-public");
  if (classified.kind !== "old-public") return;
  assert.equal(classified.ref.bucket, "uploads");
  assert.equal(classified.ref.objectPath, "events/minutes/club/file.pdf");
  assert.equal(
    classified.nextUrl,
    "https://fgryedvsunlmgbiuqoit.supabase.co/storage/v1/object/public/uploads/events/minutes/club/file.pdf"
  );
});

test("external links, app paths, and the new project are left alone", () => {
  assert.equal(classifyStoredValue("https://forms.gle/example", "url").kind, "external");
  assert.equal(classifyStoredValue("/uploads/events/a.pdf", "url").kind, "app-path");
  assert.equal(
    classifyStoredValue(
      "https://fgryedvsunlmgbiuqoit.supabase.co/storage/v1/object/public/uploads/events/a.pdf",
      "url"
    ).kind,
    "already-new"
  );
});

test("private and signed URLs are not turned into public links", () => {
  const signed = classifyStoredValue(
    "https://xtojaphqdxdrrodskqar.supabase.co/storage/v1/object/sign/event-registrations/id/proof.pdf?token=abc",
    "url"
  );
  assert.equal(signed.kind, "signed-or-private");
  const publicPrivateBucket = classifyStoredValue(
    "https://xtojaphqdxdrrodskqar.supabase.co/storage/v1/object/public/event-registrations/id/proof.pdf",
    "url"
  );
  assert.equal(publicPrivateBucket.kind, "signed-or-private");
});

test("unsafe paths and private object paths stay distinct", () => {
  assert.equal(classifyStoredValue("../secret.pdf", "private-path").kind, "unsafe");
  const path = classifyStoredValue("event-registrations/evt/proof.pdf", "private-path");
  assert.equal(path.kind, "private-path");
  if (path.kind !== "private-path") return;
  assert.equal(path.objectPath, "event-registrations/evt/proof.pdf");
});

test("json rewrite changes only verified public uploads URLs", () => {
  const result = rewriteJsonValue([
    oldPdf,
    "https://example.com/keep.pdf",
    "https://xtojaphqdxdrrodskqar.supabase.co/storage/v1/object/sign/event-registrations/a/b.pdf?token=1",
  ]);
  assert.deepEqual(result.changed, ["events/minutes/club/file.pdf"]);
  assert.deepEqual(result.blocked, ["a/b.pdf"]);
  assert.equal((result.next as string[])[1], "https://example.com/keep.pdf");
  assert.match((result.next as string[])[0], /^https:\/\/fgryedvsunlmgbiuqoit\.supabase\.co\//);
});

test("selective json rewrite leaves unverified files on the old host", () => {
  const result = rewriteJsonSelective([oldPdf, "https://example.com/keep.pdf"], () => false);
  assert.equal(result.changed, 0);
  assert.equal(result.leftBlocked, 1);
  assert.equal((result.next as string[])[0], oldPdf);
});

test("existing destination objects are never treated as safe overwrites", () => {
  assert.equal(decideObject({ bytes: 10 }, null), "copy");
  assert.equal(decideObject({ bytes: 10 }, { bytes: 10 }), "skip-same-size");
  assert.equal(decideObject({ bytes: 10 }, { bytes: 11 }), "conflict");
  assert.equal(decideObject(null, null), "missing-source");
});

test("a backup larger than the free cap is refused", () => {
  const decision = quotaDecision(1_626_808_069, 0);
  assert.equal(decision.allowed, false);
  assert.equal(decision.shortfall, 626_808_069);
});

test("partial selection keeps referenced files ahead of unreferenced ones", () => {
  const selected = selectWithinQuota(
    [
      { key: "big-ref", bytes: 80, referenced: true },
      { key: "small-ref", bytes: 20, referenced: true },
      { key: "small-extra", bytes: 10, referenced: false },
    ],
    20
  );
  assert.deepEqual(
    selected.chosen.map((file) => file.key),
    ["small-ref"]
  );
  assert.equal(selected.bytes, 20);
});

test("url rewrite waits for a checksum, and rollback will not clobber later edits", () => {
  assert.equal(referenceRewriteAllowed("size-match"), false);
  assert.equal(referenceRewriteAllowed("uploaded-sha256"), true);
  assert.equal(rollbackAction("new-url", "new-url", "old-url"), "restore");
  assert.equal(rollbackAction("edited-url", "new-url", "old-url"), "skip-changed");
  assert.equal(rollbackAction("old-url", "new-url", "old-url"), "already-restored");
});

test("copy and rewrite stay behind the dry run and verification gates", () => {
  assert.equal(canStart("copy", "not_started"), false);
  assert.equal(canStart("copy", "dry_run_complete"), true);
  assert.equal(canStart("rewrite", "dry_run_complete"), false);
  assert.equal(canStart("rewrite", "files_verified"), true);
  assert.equal(canStart("rollback", "completed"), true);
  assert.equal(canStart("rollback", "dry_run_complete"), false);
});

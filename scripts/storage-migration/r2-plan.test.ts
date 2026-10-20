import assert from "node:assert/strict";
import test from "node:test";
import { missingR2Env, privateDownloadDecision, r2Endpoint, uploadDestination } from "../../src/lib/storage/r2-config";
import {
  historicalObjectKey,
  publicObjectUrl,
  r2BucketForSource,
  r2RewriteGate,
  r2UploadDecision,
  shouldRetryR2,
} from "./r2-plan";

test("R2 secrets are required and are not public env names", () => {
  const missing = missingR2Env({});
  assert.ok(missing.includes("R2_SECRET_ACCESS_KEY"));
  assert.equal(missing.some((key) => key.startsWith("NEXT_PUBLIC_")), false);
  assert.equal(uploadDestination({}), "supabase");
  assert.equal(
    uploadDestination({
      R2_ACCOUNT_ID: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      R2_ACCESS_KEY_ID: "key",
      R2_SECRET_ACCESS_KEY: "secret",
      R2_BUCKET_PUBLIC: "public-bucket",
      R2_BUCKET_PRIVATE: "private-bucket",
    }),
    "r2"
  );
});

test("the R2 endpoint is derived from the account id", () => {
  assert.equal(
    r2Endpoint("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    "https://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.r2.cloudflarestorage.com"
  );
  assert.throws(() => r2Endpoint("not-an-account"));
});

test("arbitrary URLs and unsafe paths are not R2 object keys", () => {
  assert.equal(historicalObjectKey("https://evil.example/uploads/a.pdf"), null);
  assert.equal(historicalObjectKey("../secret.pdf"), null);
  assert.equal(historicalObjectKey("events/minutes/file.pdf"), "events/minutes/file.pdf");
});

test("public and private archives use different buckets, and private stays private", () => {
  assert.deepEqual(r2BucketForSource("uploads", { publicBucket: "hist-public" }), {
    bucket: "hist-public",
    access: "public",
  });
  assert.deepEqual(r2BucketForSource("event-registrations", { privateBucket: "hist-private" }), {
    bucket: "hist-private",
    access: "private",
  });
  assert.equal(r2BucketForSource("uploads", {}).bucket, null);
  assert.equal(privateDownloadDecision(false), "deny");
  assert.equal(privateDownloadDecision(true), "presign");
});

test("existing R2 objects are not overwritten when the checksum differs or is unknown", () => {
  assert.equal(r2UploadDecision(null, null), "missing_source");
  assert.equal(r2UploadDecision({ bytes: 10, sha256: "abc" }, null), "pending_approval");
  assert.equal(
    r2UploadDecision({ bytes: 10, sha256: "abc" }, { exists: true, sha256: "abc", size: 10 }),
    "skipped"
  );
  assert.equal(
    r2UploadDecision({ bytes: 10, sha256: "abc" }, { exists: true, sha256: "def", size: 10 }),
    "conflict"
  );
  assert.equal(
    r2UploadDecision({ bytes: 10, sha256: "abc" }, { exists: true, sha256: null, size: 10 }),
    "conflict"
  );
});

test("retries, reference approval, and rollback gates stay closed", () => {
  assert.equal(shouldRetryR2("uploading"), true);
  assert.equal(shouldRetryR2("verified"), false);
  assert.equal(r2RewriteGate({ approve: true, state: "verified", recoveryVerified: false }), "missing_recovery");
  assert.equal(r2RewriteGate({ approve: true, state: "uploaded", recoveryVerified: true }), "unverified");
  assert.equal(r2RewriteGate({ approve: false, state: "verified", recoveryVerified: true }), "needs_approval");
  assert.equal(r2RewriteGate({ approve: true, state: "verified", recoveryVerified: true }), "apply");
  assert.equal(publicObjectUrl(null, "events/a.pdf"), null);
  assert.equal(publicObjectUrl("https://files.example", "events/a.pdf"), "https://files.example/events/a.pdf");
});

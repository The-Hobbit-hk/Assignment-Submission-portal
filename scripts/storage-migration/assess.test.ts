import assert from "node:assert/strict";
import test from "node:test";
import {
  assessSnapshotFiles,
  checksumStatus,
  databaseRestoreDecision,
  interpretSyncLog,
  quotaStopsBeforeUpload,
  referenceWriteGate,
  rollbackAction,
  rollbackGate,
  shouldRetryUpload,
} from "./assess";
import { decideObject, rollbackAction as planRollback } from "./plan";

test("an empty database snapshot cannot be restored", () => {
  assert.equal(assessSnapshotFiles([]).status, "empty");
  assert.equal(assessSnapshotFiles([{ name: "data.json", bytes: 0 }]).status, "empty");
  assert.equal(
    databaseRestoreDecision({ snapshotStatus: "empty", destinationRows: 194, approve: true }),
    "refuse-empty-snapshot"
  );
});

test("a populated destination is kept when a usable snapshot exists", () => {
  const snapshot = assessSnapshotFiles([{ name: "data.json", bytes: 20 }]);
  assert.equal(snapshot.status, "usable");
  assert.equal(
    databaseRestoreDecision({ snapshotStatus: "usable", destinationRows: 194, approve: true }),
    "keep-destination"
  );
});

test("a zero-remote sync after the last success makes the mirror ambiguous", () => {
  const sync = interpretSyncLog([
    { at: "20261015-223133", downloaded: 0, skipped: 2988, failed: 0, remoteObjects: 2988 },
    { at: "20261016-114434", downloaded: 0, skipped: 0, failed: 0, remoteObjects: 0 },
    { at: "20261018-110048", downloaded: 0, skipped: 0, failed: 0, remoteObjects: 0 },
  ]);
  assert.equal(sync.lastVerifiedRemoteAt, "20261015-223133");
  assert.equal(sync.lastVerifiedRemoteObjects, 2988);
  assert.equal(sync.ambiguousAfterLastSuccess, true);
  assert.equal(sync.zeroRemoteRunsAfter, 2);
});

test("missing local files and checksum mismatches are not successful copies", () => {
  assert.equal(decideObject(null, null), "missing-source");
  assert.equal(checksumStatus("abc", "abc"), "checksum-match");
  assert.equal(checksumStatus("abc", "def"), "checksum-mismatch");
});

test("a different destination object is a conflict, and a repeat run does not overwrite a size match", () => {
  assert.equal(decideObject({ bytes: 10 }, { bytes: 11 }), "conflict");
  assert.equal(decideObject({ bytes: 10 }, { bytes: 10 }), "skip-same-size");
  assert.equal(shouldRetryUpload("copying"), true);
  assert.equal(shouldRetryUpload("copied"), false);
});

test("quota exhaustion stops before an upload", () => {
  assert.equal(quotaStopsBeforeUpload(1_626_808_069, 0, 1_000_000_000), true);
  assert.equal(quotaStopsBeforeUpload(10, 0, 1_000_000_000), false);
});

test("reference writes require both verification and a separate approval", () => {
  assert.equal(referenceWriteGate({ approve: true, verification: "size-match" }), "unverified");
  assert.equal(referenceWriteGate({ approve: false, verification: "checksum-match" }), "needs-approval");
  assert.equal(referenceWriteGate({ approve: true, verification: "checksum-match" }), "apply");
});

test("rollback without a snapshot is refused, and a later edit is not overwritten", () => {
  assert.equal(rollbackGate({ snapshotRows: 0, approve: true, dryRun: false }), "missing-snapshot");
  assert.equal(rollbackGate({ snapshotRows: 2, approve: false, dryRun: true }), "preview");
  assert.equal(rollbackGate({ snapshotRows: 2, approve: false, dryRun: false }), "needs-approval");
  assert.equal(planRollback("edited", "migrated", "original"), "skip-changed");
  assert.equal(rollbackAction, planRollback);
});

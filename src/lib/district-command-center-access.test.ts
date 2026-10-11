import assert from "node:assert/strict";
import test from "node:test";
import { canViewDistrictCommandCenter } from "./roles";

test("the website admin account can open the command center", () => {
  assert.equal(canViewDistrictCommandCenter("DISTRICT_ADMIN", "admin@rotaract3131.org"), true);
  assert.equal(canViewDistrictCommandCenter("DISTRICT_ADMIN", "Admin@Rotaract3131.org"), true);
});

test("the DRR and district council cannot open the command center", () => {
  assert.equal(
    canViewDistrictCommandCenter("SUPER_ADMIN", "rtr.dr.karishmaawari@gmail.com"),
    false
  );
  assert.equal(
    canViewDistrictCommandCenter("COUNCIL_MEMBER", "devsharan52@gmail.com"),
    false
  );
  assert.equal(
    canViewDistrictCommandCenter("DISTRICT_SECRETARY", "rtr.harshvardhan3131@gmail.com"),
    false
  );
  assert.equal(canViewDistrictCommandCenter("DISTRICT_ADMIN", "someone-else@rotaract3131.org"), false);
  assert.equal(canViewDistrictCommandCenter("SUPER_ADMIN", null), false);
});

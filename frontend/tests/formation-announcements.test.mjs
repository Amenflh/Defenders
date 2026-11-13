import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isFeaturedPilatesCoursePast } from "../src/lib/formation-announcements.ts";

describe("Pilates announcement dates", () => {
  it("keeps the announcement current through the end of 6 December 2026 in Tunisia", () => {
    assert.equal(isFeaturedPilatesCoursePast(new Date("2026-12-06T23:59:59+01:00")), false);
  });

  it("marks the announcement as past after its final announced date", () => {
    assert.equal(isFeaturedPilatesCoursePast(new Date("2026-12-07T00:00:00+01:00")), true);
  });
});

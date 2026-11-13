import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { historyFor } from "../src/lib/history.ts";

describe("division archive", () => {
  it("keeps source-backed course details distinct from confirmed sessions", () => {
    const pilates = historyFor("pilates");
    const facebookAnnouncement = pilates.find((entry) => entry.id === "fitness-pilates-matwork-reformer-announcement");
    assert.ok(facebookAnnouncement);
    assert.equal(facebookAnnouncement.date, undefined);
    assert.equal(facebookAnnouncement.status, "course");
    assert.equal(facebookAnnouncement.participants, undefined);
    assert.equal(facebookAnnouncement.additionalSources?.length, 1);
    assert.equal(facebookAnnouncement.embeddedVideos?.length, 2);
    assert.match(facebookAnnouncement.description.en, /40 hours over six days in Nabeul/);
    const datedPilatesPost = pilates.find((entry) => entry.id === "fitness-pilates-course-post-2026-11-05");
    assert.equal(datedPilatesPost?.embeddedVideos?.[0].platform, "instagram");
  });

  it("returns all selected Fitness disciplines in reverse chronological order", () => {
    const entries = historyFor(["pilates", "football"]);
    assert.deepEqual(entries.map((entry) => entry.id), [
      "fitness-pilates-course-post-2026-11-05",
      "fitness-football-registration-2026-06-09",
      "fitness-pilates-matwork-reformer-announcement",
      "fitness-football-coach-course-announcement",
    ]);
  });

  it("archives the football course details without inventing a session date", () => {
    const entry = historyFor("football").find((item) => item.id === "fitness-football-coach-course-announcement");
    assert.ok(entry);
    assert.equal(entry.date, undefined);
    assert.equal(entry.status, "course");
    assert.equal(entry.place?.en, "Hammamet, Tunisia");
    assert.equal(entry.embeddedVideos?.length, 1);
    assert.match(entry.description.en, /750 TND/);
    assert.match(entry.description.en, /full-board accommodation with three meals daily/);
  });

  it("archives the K9 course with its source publication date", () => {
    const entry = historyFor("tsa").find((item) => item.id === "tsa-k9-training-announcement-2026-05-03");
    assert.ok(entry);
    assert.equal(entry.date, "2026-05-03");
    assert.equal(entry.status, "course");
    assert.equal(entry.place?.en, "Manouba, Tunisia");
    assert.equal(entry.embeddedVideos, undefined);
  });

  it("keeps training-related security records and excludes service or partnership items", () => {
    const securityCourses = historyFor("tsa");
    assert.ok(securityCourses.some((item) => item.id === "tsa-cfa-la-marsa-announcement-2026-10-23"));
    assert.equal(historyFor("securite").length, 0);
    assert.equal(historyFor().some((item) => item.id.includes("jasmin-open") || item.id.includes("partnership")), false);
  });

  it("embeds the first-response video on the academy history entry", () => {
    const entry = historyFor("tsa").find((item) => item.id === "tsa-security-officers-announcement-2026-09-08");
    assert.ok(entry);
    assert.equal(entry.embeddedVideos?.length, 1);
    assert.equal(entry.status, "course");
  });

  it("embeds the CFA La Marsa first-response video with its matching archive entry", () => {
    const entry = historyFor("tsa").find((item) => item.id === "tsa-cfa-la-marsa-announcement-2026-10-23");
    assert.ok(entry);
    assert.equal(entry.embeddedVideos?.[0].url, "https://www.facebook.com/reel/1747595872982498/");
    assert.equal(entry.sourceUrl, "https://www.facebook.com/share/r/1D4ZZCjZku/");
  });
});

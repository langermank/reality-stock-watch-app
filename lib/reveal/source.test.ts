import { describe, expect, it } from "vitest";

import { buildWeekRankings, seasonNumberFromName } from "./source";

const weeks = [
  { id: "s1", weekNumber: 1 },
  { id: "s2", weekNumber: 2 },
];

describe("seasonNumberFromName", () => {
  it("extracts the trailing number", () => {
    expect(seasonNumberFromName("Big Brother 27")).toBe(27);
  });

  it("falls back to 1 when there is no number", () => {
    expect(seasonNumberFromName("All Stars")).toBe(1);
  });
});

describe("buildWeekRankings", () => {
  const rows = [
    { survey_id: "s2", contestant_id: "b", rank: 2, score: 8 },
    { survey_id: "s1", contestant_id: "a", rank: 1, score: 10 },
    { survey_id: "s2", contestant_id: "a", rank: 1, score: 9 },
    { survey_id: "s1", contestant_id: "b", rank: 2, score: 7 },
  ];

  it("groups rows by survey and orders weeks and entries", () => {
    const result = buildWeekRankings(rows, weeks);

    expect(result.map((week) => week.weekNumber)).toEqual([1, 2]);
    expect(result[0].weekId).toBe("s1");
    expect(result[0].entries.map((entry) => entry.contestantId)).toEqual(["a", "b"]);
    expect(result[0].entries[0]).toMatchObject({ rank: 1, score: 10, revealed: false });
  });

  it("drops rows whose survey has no matching week", () => {
    const orphaned = [{ survey_id: "ghost", contestant_id: "a", rank: 1, score: 5 }];
    expect(buildWeekRankings(orphaned, weeks)).toEqual([]);
  });

  it("leaves every entry ungated (reveal gating happens downstream)", () => {
    const result = buildWeekRankings(rows, weeks);
    const allEntries = result.flatMap((week) => week.entries);
    expect(allEntries.every((entry) => entry.revealed === false)).toBe(true);
  });
});

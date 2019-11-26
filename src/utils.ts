import fs from "fs";

export const GetTestPath = (testName: string) => `./tests/${testName}`;

export const IsDirectory = (source: string) =>
  fs.lstatSync(source).isDirectory();

export const GetJsonFile = (filepath: string) =>
  fs.readFileSync(filepath, "utf8");

export const GetDisplayDate = (date?: Date) => {
  const now = date || new Date();
  // Date toISOString() generates this format: 2019-11-19T03:30:12.113Z
  return now
    .toISOString()
    .slice(0, 19)
    .replace(/:/g, "-");
};

export interface ITestRun {
  report: string;
  test: string;
  speedIndexScore: number;
  speedIndexMs: number;
}

export interface ITestAverage {
  test: string;
  numRuns: number;
  speedIndexScoreAvg: string;
  speedIndexMsAvg: string;
  speedIndexScoreMed: string;
  speedIndexMsMed: string;
}

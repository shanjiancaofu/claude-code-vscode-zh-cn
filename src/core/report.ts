import path from "node:path";
import { PatchReport } from "./types";
import { reportRoot, timestampId } from "../utils/path";
import { pathExists, readJson, writeJson } from "../utils/fs";

export async function saveReport(report: PatchReport): Promise<string> {
  const timestamped = path.join(reportRoot(), `${timestampId(new Date(report.createdAt))}-${report.operation}.json`);
  await writeJson(timestamped, report);
  await writeJson(path.join(reportRoot(), "latest-report.json"), report);
  return timestamped;
}

export function latestReportPath(): string {
  return path.join(reportRoot(), "latest-report.json");
}

export async function showLatestReport(): Promise<PatchReport | undefined> {
  const file = latestReportPath();
  return (await pathExists(file)) ? readJson<PatchReport>(file) : undefined;
}

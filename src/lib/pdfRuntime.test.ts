import { afterEach, describe, expect, it } from "vitest";
import { PdfExportBusyError, resetPdfRuntimeForTests, runExclusivePdfJob } from "./pdfRuntime";

describe("PDF runtime", () => {
  afterEach(() => {
    resetPdfRuntimeForTests();
  });

  it("allows only one PDF job at a time", async () => {
    const releaseJob: { current?: () => void } = {};
    const firstJob = runExclusivePdfJob(() => new Promise<void>((resolve) => {
      releaseJob.current = resolve;
    }));

    await expect(runExclusivePdfJob(async () => "second")).rejects.toBeInstanceOf(PdfExportBusyError);

    releaseJob.current?.();
    await firstJob;

    await expect(runExclusivePdfJob(async () => "third")).resolves.toBe("third");
  });
});

"use client";

import "@univerjs/preset-sheets-core/lib/index.css";
import { useEffect, useRef } from "react";
import type { WorkbookInit } from "@/content/schema";
import {
  extractSnapshot,
  type ExtractableWorkbook,
} from "@/lib/univer/extract-snapshot";
import type { ValidationSnapshot } from "@/lib/validators/types";
import { toUniverWorkbook } from "@/lib/univer/to-univer-workbook";

export type GetSnapshot = () => Promise<ValidationSnapshot>;

/**
 * Mounts a full Univer spreadsheet for one task. Univer is heavy, so it is
 * imported dynamically inside the effect — it never lands in the server
 * bundle or on pages without a lesson. The parent remounts this component
 * per task (via key), so each task starts from its own workbook snapshot.
 */
export function UniverEditor({
  workbook,
  onReady,
}: {
  workbook: WorkbookInit;
  onReady: (getSnapshot: GetSnapshot) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let disposed = false;
    let univer: { dispose(): void } | undefined;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const [{ createUniver, LocaleType, mergeLocales }, presetModule, plPL] =
        await Promise.all([
          import("@univerjs/presets"),
          import("@univerjs/preset-sheets-core"),
          import("@univerjs/preset-sheets-core/locales/pl-PL"),
        ]);
      if (disposed) return;

      const { univer: u, univerAPI } = createUniver({
        locale: LocaleType.PL_PL,
        locales: { [LocaleType.PL_PL]: mergeLocales(plPL.default) },
        presets: [presetModule.UniverSheetsCorePreset({ container })],
      });
      univer = u;
      univerAPI.createWorkbook(toUniverWorkbook(workbook) as never);

      onReadyRef.current(async () => {
        const wb = univerAPI.getActiveWorkbook();
        if (!wb) return { sheets: {} };
        return extractSnapshot(wb as unknown as ExtractableWorkbook);
      });
    })().catch((error) => {
      // Editor failure should not take the whole page down.
      console.error("Univer initialization failed:", error);
    });

    return () => {
      disposed = true;
      // Per the official Next.js guide: dispose off the React commit path.
      queueMicrotask(() => univer?.dispose());
    };
    // A task's workbook never changes while mounted (parent remounts via key).
  }, [workbook]);

  return <div ref={containerRef} className="h-full w-full" />;
}

export default UniverEditor;

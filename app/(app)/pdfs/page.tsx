"use client";

import React from "react";
import { useStats } from "@/components/providers/stats-provider";

export default function PdfsLibraryPage() {
  const { addXp } = useStats();

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="text-2xl font-extrabold">Your Library</h2>
      <p className="text-sm text-text-secondary">Review all assets, textbooks, and past papers uploaded to your workspace.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Maths Textbook.pdf", "English Essay Structure.docx", "Science Notes - Cells.pdf"].map((file, i) => (
          <div key={i} className="p-4 bg-surface border-2 border-border rounded-xl shadow-[0_3px_0_#141827] flex flex-col justify-between h-32">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📁</span>
              <span className="text-xs font-bold truncate">{file}</span>
            </div>
            <button
              onClick={() => addXp(5, "Reviewed library book")}
              className="w-full text-center py-1 text-xs font-bold border-2 border-border rounded-md hover:bg-bg-secondary cursor-pointer"
            >
              READ DOCUMENT
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

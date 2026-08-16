"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, BookOpen, Lock, Loader2, ChevronRight, ArrowLeft, Target } from "lucide-react";

import { useLearningPath } from "@/features/curriculum/hooks";
import { LearningPathNode, LearningPathSection } from "@/features/curriculum/types";

// ─── Hex Node ────────────────────────────────────────────────────────────────

function HexNode({
  node,
  onSelect,
}: {
  node: LearningPathNode;
  onSelect: (node: LearningPathNode) => void;
}) {
  const isCompleted = node.status === "COMPLETED";
  const isCurrent = node.status === "CURRENT";
  const isLocked = node.status === "LOCKED";

  return (
    <button
      type="button"
      onClick={() => !isLocked && onSelect(node)}
      disabled={isLocked}
      aria-label={node.subtopic.name}
      className={[
        "relative flex items-center justify-center w-16 h-16 transition-all duration-150",
        !isLocked ? "hover:-translate-y-1 active:translate-y-0.5 cursor-pointer" : "cursor-not-allowed opacity-55",
      ].join(" ")}
      style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}
    >
      <div
        className={[
          "absolute inset-0 border-[3px] transition-colors",
          isCompleted ? "bg-secondary border-border drop-shadow-[0_4px_0_rgba(20,24,39,0.9)]" : "",
          isCurrent ? "bg-primary border-border drop-shadow-[0_4px_0_rgba(20,24,39,0.9)]" : "",
          isLocked ? "bg-surface-muted border-border-muted" : "",
        ].join(" ")}
        style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}
      />
      <div className="relative z-10 flex items-center justify-center">
        {isCompleted && <CheckCircle2 size={22} className="text-text-primary stroke-[2.5]" />}
        {isCurrent && <BookOpen size={22} className="text-text-primary stroke-[2.5]" />}
        {isLocked && <Lock size={18} className="text-text-secondary stroke-[2]" />}
      </div>
    </button>
  );
}

// ─── Connector Line ───────────────────────────────────────────────────────────

function Connector({ completed }: { completed: boolean }) {
  return (
    <div className="flex justify-center pointer-events-none h-6">
      <div
        className={[
          "w-1 h-full rounded-full",
          completed ? "bg-border" : "bg-border-muted opacity-40",
        ].join(" ")}
      />
    </div>
  );
}

// ─── Current Node Popup ───────────────────────────────────────────────────────

function NodePopup({
  node,
  subjectId,
  onClose,
}: {
  node: LearningPathNode;
  subjectId: string;
  onClose: () => void;
}) {
  const isCurrent = node.status === "CURRENT";
  const isCompleted = node.status === "COMPLETED";

  return (
    <div className="w-full max-w-[260px] mx-auto mt-3 mb-1 bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-5 flex flex-col gap-4 animate-in zoom-in-95 fade-in duration-200 relative">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          {isCompleted ? "Completed" : "Up next"}
        </span>
        <h4 className="text-sm font-black text-text-primary leading-snug">
          {node.subtopic.name}
        </h4>
      </div>
      <Link
        href={`/study/quiz?subtopicId=${node.subtopic.id}&subjectId=${subjectId}`}
        className="w-full py-3 bg-primary text-text-primary border-[3px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 transition-all text-center tracking-widest"
        onClick={onClose}
      >
        {isCompleted ? "PRACTICE AGAIN" : "CONTINUE"}
      </Link>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function PathSection({
  section,
  subjectId,
}: {
  section: LearningPathSection;
  subjectId: string;
}) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(
    () => section.nodes.find((n) => n.status === "CURRENT")?.subtopic.id ?? null,
  );

  const activeNode = section.nodes.find((n) => n.subtopic.id === activeNodeId) ?? null;

  function handleSelect(node: LearningPathNode) {
    setActiveNodeId((prev) => (prev === node.subtopic.id ? null : node.subtopic.id));
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Section header */}
      <div className="w-full flex items-center gap-3 px-4 py-3 mb-5 bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)]">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-text-primary truncate">{section.topic.name}</h3>
            <span className="text-[11px] font-bold text-text-secondary whitespace-nowrap">
              {section.completedSubtopics} / {section.totalSubtopics}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: section.totalSubtopics }).map((_, i) => (
              <div
                key={i}
                className={[
                  "flex-1 h-2 rounded-full border border-border-muted transition-colors duration-300",
                  i < section.completedSubtopics ? "bg-primary" : "bg-surface-muted",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Nodes */}
      <div className="flex flex-col items-center w-full">
        {section.nodes.map((node, idx) => {
          const isNodeActive = activeNodeId === node.subtopic.id;
          const isAltSide = idx % 2 !== 0;

          return (
            <React.Fragment key={node.subtopic.id}>
              {idx > 0 && (
                <Connector
                  completed={
                    section.nodes[idx - 1].status === "COMPLETED" ||
                    node.status === "COMPLETED"
                  }
                />
              )}

              <div
                className={[
                  "flex w-full max-w-xs items-center",
                  isAltSide ? "justify-end pr-10" : "justify-start pl-10",
                ].join(" ")}
              >
                <HexNode node={node} onSelect={handleSelect} />
              </div>

              {isNodeActive && activeNode && (
                <NodePopup
                  node={activeNode}
                  subjectId={subjectId}
                  onClose={() => setActiveNodeId(null)}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPathPage() {
  const params = useParams<{ subjectSlug: string }>();
  const router = useRouter();
  const slug = params.subjectSlug;

  const { data: path, isLoading, error } = useLearningPath(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-bold">Loading study path…</span>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-muted border-[2px] border-border flex items-center justify-center">
          <Target size={28} className="text-text-secondary" />
        </div>
        <h3 className="text-base font-black text-text-primary">Path not found</h3>
        <p className="text-xs text-text-secondary max-w-xs">
          We couldn&apos;t load this learning path. Make sure you&apos;re signed in.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_3px_0_#141827] active:translate-y-0.5 transition-all"
        >
          GO BACK
        </button>
      </div>
    );
  }

  // Find which section contains the current node for breadcrumb
  let currentSection: LearningPathSection | undefined;
  let currentNodeOrder = 0;
  for (const section of path.sections) {
    const cur = section.nodes.find((n) => n.status === "CURRENT");
    if (cur) {
      currentSection = section;
      currentNodeOrder = cur.order;
      break;
    }
  }

  const cappedTotal = Math.min(path.totalNodes, 24);

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* ── Header card: breadcrumb + segmented global progress ── */}
      <div className="bg-surface border-[2px] border-border rounded-2xl shadow-[0_4px_0_rgba(20,24,39,0.9)] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
          <Link
            href="/study"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            Study
          </Link>
          <ChevronRight size={12} className="text-text-secondary" />
          <span className="text-text-primary font-black">{path.subject.name}</span>
          {currentSection && (
            <>
              <ChevronRight size={12} className="text-text-secondary" />
              <span className="text-text-secondary">
                Section {currentSection.topic.order + 1} · Chapter {currentNodeOrder + 1}
              </span>
            </>
          )}
        </div>

        <h2 className="text-xl font-black text-text-primary">
          {path.subject.name}
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-[3px]">
            {Array.from({ length: cappedTotal }).map((_, i) => (
              <div
                key={i}
                className={[
                  "flex-1 h-2.5 rounded-full border border-border-muted transition-colors duration-300",
                  i < path.completedNodes ? "bg-primary" : "bg-surface-muted",
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-xs font-black text-text-secondary whitespace-nowrap">
            {path.completedNodes} / {path.totalNodes}
          </span>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="flex flex-col gap-10">
        {path.sections.map((section) => (
          <PathSection
            key={section.topic.id}
            section={section}
            subjectId={path.subject.id}
          />
        ))}
      </div>

      {/* ── All done banner ── */}
      {path.completedNodes === path.totalNodes && path.totalNodes > 0 && (
        <div className="bg-secondary/20 border-[2px] border-border rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-[0_4px_0_rgba(20,24,39,0.9)]">
          <CheckCircle2 size={36} className="text-text-primary" />
          <h3 className="text-lg font-black text-text-primary">Subject Complete! 🎉</h3>
          <p className="text-xs text-text-secondary max-w-xs">
            You&apos;ve completed all subtopics in {path.subject.name}. Time for a mock exam!
          </p>
          <Link
            href="/study/mock-exams"
            className="px-6 py-3 bg-primary border-[3px] border-border rounded-xl text-xs font-black shadow-[0_4px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all"
          >
            TAKE MOCK EXAM
          </Link>
        </div>
      )}
    </div>
  );
}

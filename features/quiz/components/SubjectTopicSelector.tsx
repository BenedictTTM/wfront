"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Zap, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSubjects, useTopics } from "@/features/curriculum/hooks";
import { AttemptMode } from "../types";

interface SubjectTopicSelectorProps {
  onStartQuiz: (subjectId: string, topicId?: string, mode?: AttemptMode) => void;
  isStarting: boolean;
  userEnergy?: number;
}

export function SubjectTopicSelector({
  onStartQuiz,
  isStarting,
  userEnergy = 30,
}: SubjectTopicSelectorProps) {
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  const activeSubjectId = selectedSubjectId || (subjects && subjects.length > 0 ? subjects[0].id : "");
  const { data: topics, isLoading: loadingTopics } = useTopics(activeSubjectId);
  const selectedSubject = subjects?.find((s) => s.id === activeSubjectId);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId("");
  };

  const handleStart = () => {
    if (!activeSubjectId) return;
    onStartQuiz(activeSubjectId, selectedTopicId || undefined, "PRACTICE");
  };

  const insufficientEnergy = userEnergy < 3;

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[2px] border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 border-[2px] border-border rounded-xl shadow-[0_2px_0_rgba(20,24,39,0.9)]">
            <BookOpen className="w-5 h-5 text-text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary">Practice Quiz</h3>
            <p className="text-xs text-text-secondary font-medium">
              Choose a subject to generate questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 border-[2px] border-border rounded-full text-xs font-black text-text-primary">
          <Zap size={13} className="fill-primary text-primary" />
          <span>3 Energy</span>
        </div>
      </div>

      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-bold">Loading WASSCE subjects…</span>
        </div>
      ) : !subjects || subjects.length === 0 ? (
        <div className="p-6 bg-bg-primary border-[2px] border-border rounded-xl text-center text-xs font-bold text-text-secondary">
          No active subjects available at the moment.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Subject grid */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-black uppercase tracking-widest text-text-secondary">
              1. Choose Subject *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subjects.map((subj) => {
                const isSelected = activeSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleSubjectChange(subj.id)}
                    className={[
                      "p-3.5 border-[2px] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer",
                      isSelected
                        ? "bg-primary/15 border-border shadow-[0_3px_0_rgba(20,24,39,0.9)] -translate-y-0.5"
                        : "bg-bg-primary border-border-muted hover:border-border hover:bg-surface-muted",
                    ].join(" ")}
                  >
                    <span className="text-sm font-black text-text-primary">{subj.name}</span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">
                      {subj.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Path link for selected subject */}
          {selectedSubject && (
            <Link
              href={`/study/${selectedSubject.slug}`}
              className="flex items-center justify-between px-4 py-3 bg-secondary/20 border-[2px] border-border rounded-xl text-xs font-bold text-text-primary hover:bg-secondary/30 transition-colors"
            >
              <span>View full learning path for <strong>{selectedSubject.name}</strong></span>
              <ChevronRight size={14} />
            </Link>
          )}

          {/* Topic selection */}
          {selectedSubjectId && topics && topics.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center justify-between">
                <span>2. Narrow by Topic (Optional)</span>
                {loadingTopics && <Loader2 className="w-3 h-3 animate-spin" />}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTopicId("")}
                  className={[
                    "p-3 border-[2px] rounded-xl text-left text-xs font-bold transition-all cursor-pointer",
                    !selectedTopicId
                      ? "bg-primary/15 border-border shadow-[0_2px_0_rgba(20,24,39,0.9)]"
                      : "bg-bg-primary border-border-muted hover:border-border",
                  ].join(" ")}
                >
                  All Topics
                </button>
                {topics.map((t) => {
                  const isSelected = selectedTopicId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopicId(t.id)}
                      className={[
                        "p-3 border-[2px] rounded-xl text-left text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary/15 border-border shadow-[0_2px_0_rgba(20,24,39,0.9)]"
                          : "bg-bg-primary border-border-muted hover:border-border",
                      ].join(" ")}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting || !selectedSubjectId || insufficientEnergy}
              className="w-full py-3.5 bg-primary text-text-primary border-[2px] border-border rounded-xl font-black text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>STARTING…</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>BEGIN PRACTICE SESSION</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {insufficientEnergy && (
              <p className="text-xs font-bold text-text-secondary text-center">
                You need 3 Energy to start a practice quiz.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

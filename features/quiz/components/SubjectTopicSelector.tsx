import React, { useState } from "react";
import { BookOpen, Sparkles, Zap, ChevronRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  const subjectsList = Array.isArray(subjects) ? subjects : [];
  const activeSubjectId = selectedSubjectId || (subjectsList.length > 0 ? subjectsList[0].id : "");
  const { data: topics, isLoading: loadingTopics } = useTopics(activeSubjectId);
  const selectedSubject = subjectsList.find((s) => s.id === activeSubjectId);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId("");
  };

  const handleStart = () => {
    if (!activeSubjectId) return;
    onStartQuiz(activeSubjectId, selectedTopicId || undefined, "PRACTICE");
  };

  const handleReturnToStudy = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/study");
  };

  const insufficientEnergy = userEnergy < 3;

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-[3px] border-border rounded-2xl shadow-[0_6px_0_rgba(20,24,39,0.9)] p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[2.5px] border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary border-[2px] border-border rounded-xl shadow-[0_2px_0_#141827]">
            <BookOpen className="w-5 h-5 text-text-primary stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary">Practice Quiz</h3>
            <p className="text-xs text-text-secondary font-bold">
              Choose a subject to generate questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary border-[2px] border-border rounded-full text-xs font-black text-text-primary shadow-[0_1.5px_0_#141827]">
            <Zap size={13} className="fill-text-primary text-text-primary stroke-[2]" />
            <span>3 Energy</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToStudy}
            className="p-2 border-[2px] border-border rounded-xl bg-surface hover:bg-surface-muted shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Return to Study"
            title="Return to Study Center"
          >
            {/* <span className="text-xs font-black uppercase tracking-widest">Return to Study</span> */}
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-text-primary stroke-[2.5]" />
          <span className="text-xs font-black">Loading WASSCE subjects…</span>
        </div>
      ) : !subjects || subjects.length === 0 ? (
        <div className="p-6 bg-surface border-[2px] border-border rounded-xl text-center text-xs font-bold text-text-secondary shadow-[0_2px_0_#141827]">
          No active subjects available at the moment.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Subject grid */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-black uppercase tracking-widest text-text-secondary">
              1. Choose Subject *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((subj) => {
                const isSelected = activeSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleSubjectChange(subj.id)}
                    className={[
                      "p-4 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer",
                      isSelected
                        ? "bg-primary border-[2.5px] border-border shadow-[0_3px_0_#141827] -translate-y-0.5"
                        : "bg-surface border-[2px] border-border hover:bg-bg-primary shadow-[0_2px_0_#141827] active:translate-y-0.5",
                    ].join(" ")}
                  >
                    <span className="text-sm font-black text-text-primary">{subj.name}</span>
                    <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider mt-1.5">
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
              className="flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 border-[2px] border-border rounded-xl text-xs font-black text-text-primary shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all"
            >
              <span>View full learning path for <strong>{selectedSubject.name}</strong></span>
              <ChevronRight size={16} className="stroke-[3]" />
            </Link>
          )}

          {/* Topic selection */}
          {selectedSubjectId && topics && topics.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center justify-between">
                <span>2. Narrow by Topic (Optional)</span>
                {loadingTopics && <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[3]" />}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTopicId("")}
                  className={[
                    "p-3 rounded-xl text-left text-xs font-black transition-all cursor-pointer",
                    !selectedTopicId
                      ? "bg-primary border-[2px] border-border shadow-[0_2px_0_#141827]"
                      : "bg-surface border-[2px] border-border hover:bg-bg-primary shadow-xs",
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
                        "p-3 rounded-xl text-left text-xs font-black transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary border-[2px] border-border shadow-[0_2px_0_#141827]"
                          : "bg-surface border-[2px] border-border hover:bg-bg-primary shadow-xs",
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
              disabled={isStarting || !activeSubjectId || insufficientEnergy}
              className="w-full py-3.5 bg-primary text-text-primary border-[2.5px] border-border rounded-xl font-black text-sm shadow-[0_4px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
                  <span>STARTING…</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="stroke-[2.5]" />
                  <span>BEGIN PRACTICE SESSION</span>
                  <ChevronRight size={16} className="stroke-[3]" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReturnToStudy}
              className="w-full py-2.5 bg-surface text-text-secondary hover:text-text-primary border-[2px] border-border rounded-xl font-black text-xs text-center shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all cursor-pointer"
            >
              RETURN TO STUDY CENTER
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


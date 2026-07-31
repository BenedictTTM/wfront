"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Zap, ChevronRight, Loader2 } from "lucide-react";
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

  const { data: topics, isLoading: loadingTopics } = useTopics(selectedSubjectId);

  // Auto-select first subject when loaded if none selected
  React.useEffect(() => {
    if (subjects && subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId("");
  };

  const handleStart = () => {
    if (!selectedSubjectId) return;
    onStartQuiz(selectedSubjectId, selectedTopicId || undefined, "PRACTICE");
  };

  const insufficientEnergy = userEnergy < 3;

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b-2 border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 border-2 border-border rounded-xl">
            <BookOpen className="w-5 h-5 text-text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary">Practice Quiz Setup</h3>
            <p className="text-xs text-text-secondary font-medium">
              Select your target subject to generate practice questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border-2 border-border rounded-full text-xs font-bold text-yellow-600 dark:text-yellow-400">
          <Zap size={14} className="fill-yellow-500 text-yellow-500" />
          <span>3 Energy</span>
        </div>
      </div>

      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-bold">Loading WASSCE subjects...</span>
        </div>
      ) : !subjects || subjects.length === 0 ? (
        <div className="p-6 bg-surface-muted border-2 border-border rounded-xl text-center text-xs font-bold text-text-secondary">
          No active subjects available at the moment.
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Subject selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-text-secondary tracking-wider">
              1. Choose Subject *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subjects.map((subj) => {
                const isSelected = selectedSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleSubjectChange(subj.id)}
                    className={`p-3.5 border-2 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary text-text-primary shadow-[0_2px_0_var(--color-primary,#141827)] font-black"
                        : "bg-bg-primary border-border hover:bg-surface-muted text-text-secondary font-bold"
                    }`}
                  >
                    <span className="text-sm">{subj.name}</span>
                    <span className="text-[10px] text-text-secondary opacity-75 uppercase tracking-wide mt-1">
                      {subj.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic selection (optional) */}
          {selectedSubjectId && topics && topics.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-text-secondary tracking-wider flex items-center justify-between">
                <span>2. Choose Topic (Optional)</span>
                {loadingTopics && <Loader2 className="w-3 h-3 animate-spin" />}
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="p-3 bg-bg-primary border-2 border-border rounded-xl text-xs md:text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="">All Topics (Randomized mix)</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Launch Action */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting || !selectedSubjectId || insufficientEnergy}
              className="w-full py-3.5 bg-primary text-text-primary border-2 border-border rounded-xl font-black text-sm shadow-[0_3px_0_#141827] active:translate-y-0.5 active:shadow-[0_1px_0_#141827] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>STARTING QUIZ...</span>
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
              <p className="text-xs font-bold text-red-500 text-center">
                Insufficient energy (3 energy required to start a practice quiz).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

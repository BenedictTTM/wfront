"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, RefreshCw, CheckCircle2, XCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { QuestionAiTutorModal } from "@/features/ai/components/QuestionAiTutorModal";
import type { QuestionContext } from "@/features/ai/prompts";

const SAMPLE_QUESTIONS: Array<{
  id: string;
  subject: string;
  context: QuestionContext;
}> = [
  {
    id: "sample-1",
    subject: "Biology",
    context: {
      questionText: "Which organelle is known as the powerhouse of the cell?",
      options: [
        { key: "A", text: "Ribosome" },
        { key: "B", text: "Mitochondria" },
        { key: "C", text: "Endoplasmic Reticulum" },
        { key: "D", text: "Golgi Apparatus" },
      ],
      selectedOptionKey: "A",
      correctOptionKey: "B",
      officialExplanation:
        "Mitochondria generate most of the cell's chemical energy supply in the form of ATP through cellular respiration.",
    },
  },
  {
    id: "sample-2",
    subject: "Physics",
    context: {
      questionText: "What is the SI unit of electric resistance?",
      options: [
        { key: "A", text: "Volt" },
        { key: "B", text: "Ampere" },
        { key: "C", text: "Ohm" },
        { key: "D", text: "Watt" },
      ],
      selectedOptionKey: "C",
      correctOptionKey: "C",
      officialExplanation: "Ohm (Ω) is the SI unit of electrical resistance, defined by Ohm's Law (V = IR).",
    },
  },
  {
    id: "sample-3",
    subject: "Chemistry",
    context: {
      questionText: "Which of the following elements has the electronic configuration 2, 8, 7?",
      options: [
        { key: "A", text: "Sodium" },
        { key: "B", text: "Chlorine" },
        { key: "C", text: "Argon" },
        { key: "D", text: "Magnesium" },
      ],
      selectedOptionKey: "C",
      correctOptionKey: "B",
      officialExplanation:
        "Chlorine has an atomic number of 17 (2 + 8 + 7 = 17) and is a halogen in Group 7.",
    },
  },
];

export default function AiTestPage() {
  const [activeContext, setActiveContext] = useState<QuestionContext | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/ai/tutor");
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthData({ available: false, error: err.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary text-text-primary text-[10px] font-black rounded-full border border-border uppercase">
              Dev Diagnostic Lab
            </span>
          </div>
          <h1 className="text-2xl font-black text-text-primary mt-1 flex items-center gap-2">
            <Sparkles className="text-primary stroke-[2.5]" size={24} />
            AI Tutor Sandbox
          </h1>
          <p className="text-xs font-bold text-text-secondary mt-1">
            Test solutions, streaming explanations, and conversational follow-up questions powered by Google Gemini.
          </p>
        </div>

        <Link
          href="/study"
          className="self-start sm:self-auto px-4 py-2 bg-surface hover:bg-surface-muted border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all"
        >
          Back to Study
        </Link>
      </div>

      {/* Model Connection Status Card */}
      <div className="p-5 bg-surface border-[3px] border-border rounded-2xl shadow-[0_4px_0_#141827] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-text-primary stroke-[2.5]" />
            <span className="text-xs font-black text-text-primary uppercase tracking-wider">
              AI Service Connection Status
            </span>
          </div>
          <button
            type="button"
            onClick={checkHealth}
            disabled={isChecking}
            className="px-3 py-1 bg-surface-muted hover:bg-surface border-[2px] border-border rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[0_1.5px_0_#141827] active:translate-y-0.5 transition-all"
          >
            <RefreshCw size={13} className={isChecking ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-surface-muted border-[2px] border-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">AI Service:</span>
            {healthData?.available ? (
              <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-lg border border-green-300 flex items-center gap-1">
                🟢 {healthData?.provider === "gemini" ? "Google Gemini (Online)" : "Ollama (Local)"}
              </span>
            ) : (
              <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-lg border border-red-300">
                🔴 Offline
              </span>
            )}
          </div>

          <div className="p-3 bg-surface-muted border-[2px] border-border rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Active Target Model:</span>
            <span className="text-xs font-black text-text-primary font-mono bg-surface px-2 py-0.5 rounded-lg border border-border">
              {healthData?.activeModel || "gemini-2.5-flash"}
            </span>
          </div>
        </div>

        {healthData?.models && healthData.models.length > 0 && (
          <div className="text-xs font-bold text-text-secondary">
            Available models:{" "}
            <span className="font-mono text-text-primary">
              {healthData.models.join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Test Questions */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-black text-text-primary uppercase tracking-wide flex items-center gap-2">
          <BookOpen size={16} />
          <span>Click a sample quiz question to test the AI Tutor:</span>
        </h2>

        <div className="flex flex-col gap-3">
          {SAMPLE_QUESTIONS.map((item, idx) => {
            const isCorrect = item.context.selectedOptionKey === item.context.correctOptionKey;
            return (
              <div
                key={item.id}
                className="p-5 bg-surface border-[3px] border-border rounded-2xl shadow-[0_4px_0_#141827] flex flex-col gap-3 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-surface-muted border-[1.5px] border-border rounded-lg text-[10px] font-black uppercase text-text-secondary">
                    {item.subject} • Question {idx + 1}
                  </span>
                  {isCorrect ? (
                    <span className="text-xs font-black text-text-primary flex items-center gap-1">
                      <CheckCircle2 size={15} /> Student was Correct
                    </span>
                  ) : (
                    <span className="text-xs font-black text-text-secondary flex items-center gap-1">
                      <XCircle size={15} /> Student was Incorrect
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-text-primary">
                  {item.context.questionText}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {item.context.options?.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2 rounded-lg border-[1.5px] ${
                        opt.key === item.context.correctOptionKey
                          ? "bg-secondary/20 border-border text-text-primary"
                          : opt.key === item.context.selectedOptionKey
                          ? "bg-surface-muted border-border line-through text-text-secondary"
                          : "bg-surface border-border-muted text-text-secondary"
                      }`}
                    >
                      <span className="font-black mr-1.5">[{opt.key}]</span>
                      {opt.text}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t-[1.5px] border-border">
                  <div className="text-[11px] font-bold text-text-secondary">
                    Student selected: <span className="font-black text-text-primary">Option {item.context.selectedOptionKey}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveContext(item.context)}
                    className="px-4 py-2 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="stroke-[2.5]" />
                    <span>Test AI Tutor</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {activeContext && (
        <QuestionAiTutorModal
          isOpen={!!activeContext}
          onClose={() => setActiveContext(null)}
          context={activeContext}
        />
      )}
    </div>
  );
}

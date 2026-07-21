"use client";

import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { toast } from "sonner";
import { useStats } from "@/components/providers/stats-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PracticeQuizPage() {
  const { addXp, addGems, incrementCompletedQuizzes } = useStats();
  const router = useRouter();

  // Quiz State
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Mock quiz questions
  const quizQuestions = [
    {
      question: "Which of the following is the correct formula for the sum of interior angles of an n-sided polygon?",
      options: ["(n - 2) * 180°", "(n - 1) * 180°", "(2n - 4) * 90°", "Both A and C"],
      answer: 3 // Both A and C is correct because (2n-4)*90 = (n-2)*180
    },
    {
      question: "In English grammar, a word that describes a verb, adjective, or other adverb is called a:",
      options: ["Noun", "Adjective", "Pronoun", "Adverb"],
      answer: 3
    },
    {
      question: "What is the primary function of mitochondria in a cell?",
      options: ["Protein synthesis", "Energy production (ATP)", "Waste storage", "Cell division"],
      answer: 1
    }
  ];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const submitQuizAnswer = () => {
    if (selectedAnswer === null) return;
    if (selectedAnswer === quizQuestions[currentQuizQuestion].answer) {
      setQuizScore((prev) => prev + 1);
      toast.success("Correct answer!");
    } else {
      toast.error("Oops! That's incorrect.");
    }

    if (currentQuizQuestion + 1 < quizQuestions.length) {
      setCurrentQuizQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizQuestion(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const claimQuizRewards = () => {
    const finalScore = quizScore;
    const gainedXp = finalScore * 15;
    const gainedGems = finalScore > 1 ? 5 : 0;

    addXp(gainedXp, `Completed Quiz (${finalScore}/${quizQuestions.length})`);
    if (gainedGems > 0) {
      addGems(gainedGems);
    }
    incrementCompletedQuizzes();
    router.push("/study");
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border-3 border-border rounded-2xl shadow-offset p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b-2 border-border pb-2">
        <h3 className="text-md font-extrabold flex items-center gap-2">
          <Star size={18} fill="#F6D86B" className="text-yellow-500" />
          <span>WASSCE Practice Quiz</span>
        </h3>
        <Link
          href="/study"
          className="p-1 border border-border rounded hover:bg-surface-muted"
        >
          <X size={14} />
        </Link>
      </div>

      {!quizFinished ? (
        <div className="flex flex-col gap-4">
          {/* Question progress */}
          <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
            <span>QUESTION {currentQuizQuestion + 1} OF {quizQuestions.length}</span>
            <span>SCORE: {quizScore}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 border-2 border-border rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentQuizQuestion / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question body */}
          <div className="p-4 bg-bg-primary border-2 border-border rounded-xl">
            <h4 className="font-extrabold text-sm md:text-base text-text-primary leading-relaxed">
              {quizQuestions[currentQuizQuestion].question}
            </h4>
          </div>

          {/* Options list */}
          <div className="flex flex-col gap-2.5">
            {quizQuestions[currentQuizQuestion].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full text-left p-3.5 border-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-between cursor-pointer
                  ${selectedAnswer === idx
                    ? "bg-[#FFFDF6] border-[#FF9E2C] text-[#FF9E2C] shadow-[0_2px_0_#FF9E2C]"
                    : "bg-surface border-border hover:bg-bg-secondary"
                  }`}
              >
                <span>{option}</span>
                <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-[10px]">
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border-muted">
            <button
              type="button"
              onClick={submitQuizAnswer}
              disabled={selectedAnswer === null}
              className="px-5 py-2.5 bg-primary text-text-primary border-2 border-border rounded-xl font-bold text-xs shadow-[0_2.5px_0_#141827] active:translate-y-0.5 active:shadow-[0_0.5px_0_#141827] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              {currentQuizQuestion + 1 === quizQuestions.length ? "FINISH QUIZ" : "NEXT QUESTION"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <span className="text-5xl">🎉</span>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xl font-extrabold text-text-primary">Quiz Complete!</h4>
            <p className="text-xs font-bold text-text-secondary">
              You scored <span className="text-text-primary font-extrabold">{quizScore} / {quizQuestions.length}</span> correct answers
            </p>
          </div>

          <div className="bg-[#FFFDF6] border-2 border-border p-4 rounded-xl max-w-sm flex flex-col gap-1 w-full text-xs font-bold">
            <div className="flex justify-between">
              <span>XP Granted:</span>
              <span className="text-[#FF9E2C]">+{quizScore * 15} XP</span>
            </div>
            {quizScore > 1 && (
              <div className="flex justify-between">
                <span>Gem Rewards:</span>
                <span className="text-blue-500">+5 Gems</span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-4">
            <button
              onClick={resetQuiz}
              className="px-4 py-2 border-2 border-border rounded-xl text-xs font-bold hover:bg-surface-muted cursor-pointer"
            >
              RETRY QUIZ
            </button>
            <button
              onClick={claimQuizRewards}
              className="px-5 py-2 bg-primary border-2 border-border rounded-xl text-xs font-extrabold shadow-[0_2.5px_0_#141827] cursor-pointer"
            >
              CLAIM REWARDS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

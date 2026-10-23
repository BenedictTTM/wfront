"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  AlertCircle,
  Loader2,
  Terminal,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import {
  buildInitialExplanationPrompt,
  GEMMA_SYSTEM_INSTRUCTION,
  QuestionContext,
} from "../prompts";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface QuestionAiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: QuestionContext;
}

export function QuestionAiTutorModal({
  isOpen,
  onClose,
  context,
}: QuestionAiTutorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    available: boolean;
    provider?: string;
    activeModel?: string;
    displayName?: string;
    error?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStartedRef = useRef(false);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Check AI service status
  const checkAiHealth = async () => {
    setIsCheckingHealth(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/tutor", { method: "GET" });
      const data = await res.json();
      setAiStatus(data);
      return data;
    } catch {
      const failState = {
        available: false,
        error: "Unable to reach AI tutor service.",
      };
      setAiStatus(failState);
      return failState;
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Start chat session when modal opens
  useEffect(() => {
    if (!isOpen) {
      isStartedRef.current = false;
      return;
    }

    if (isStartedRef.current) return;
    isStartedRef.current = true;

    async function init() {
      const health = await checkAiHealth();
      if (!health.available) return;

      // Prepare initial prompt
      const initialPrompt = buildInitialExplanationPrompt(context);
      const initialMessages: ChatMessage[] = [
        { role: "system", content: GEMMA_SYSTEM_INSTRUCTION },
        { role: "user", content: initialPrompt },
      ];

      setMessages(initialMessages);
      await streamResponse(initialMessages, health.activeModel);
    }

    init();
  }, [isOpen, context]);

  // Stream chat response
  const streamResponse = async (chatHistory: ChatMessage[], model?: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          model: model || aiStatus?.activeModel || "gemini-2.5-flash",
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream received.");

      const decoder = new TextDecoder();
      let accumulated = "";

      // Add empty assistant placeholder
      setMessages([...chatHistory, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
          }
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate explanation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendFollowUp = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isGenerating) return;

    if (!customPrompt) setInput("");

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: textToSend },
    ];
    setMessages(updatedMessages);

    await streamResponse(updatedMessages);
  };

  if (!isOpen) return null;

  // Filter out the internal system instruction and raw initial prompt from UI display
  const visibleMessages = messages.filter((_, idx) => idx > 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface border-[3px] border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_8px_0_#141827] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b-[2.5px] border-border bg-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary border-[2px] border-border flex items-center justify-center shadow-[0_2px_0_#141827]">
              <Sparkles size={18} className="text-text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary flex items-center gap-2">
                AI Tutor
                {aiStatus?.available ? (
                  <span className="text-[10px] bg-primary text-text-primary font-black px-2 py-0.5 rounded-full border border-border uppercase">
                    🟢 {aiStatus.displayName || aiStatus.activeModel || "Gemini 2.5 Flash"}
                  </span>
                ) : (
                  <span className="text-[10px] bg-surface-muted text-text-secondary font-bold px-2 py-0.5 rounded-full border border-border uppercase">
                    ⚪ Service Unavailable
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-bold text-text-secondary">
                Personalized solutions & conversational follow-ups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[2px] border-border bg-surface hover:bg-surface-muted transition-all cursor-pointer shadow-[0_2px_0_#141827] active:translate-y-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Question Snapshot Banner */}
        <div className="px-4 py-2.5 bg-surface-muted border-b-[2px] border-border flex items-center justify-between text-xs font-bold gap-3">
          <div className="truncate flex-1">
            <span className="text-text-secondary uppercase text-[10px] font-black mr-2">Question:</span>
            <span className="text-text-primary">{context.questionText}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-lg border text-[10px] font-black shrink-0 ${
              context.selectedOptionKey === context.correctOptionKey
                ? "bg-secondary/20 border-border text-text-primary"
                : "bg-surface border-border text-text-secondary"
            }`}
          >
            {context.selectedOptionKey === context.correctOptionKey ? "Correct" : "Incorrect"}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-[300px]">
          {isCheckingHealth ? (
            <div className="flex flex-col items-center justify-center my-auto p-6 gap-3 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-primary stroke-[2.5]" />
              <div className="text-xs font-black text-text-primary">
                Connecting to Gemini AI Tutor...
              </div>
            </div>
          ) : aiStatus && !aiStatus.available ? (
            <div className="p-6 my-auto flex flex-col items-center text-center gap-3 bg-surface border-[2px] border-border rounded-xl shadow-[0_3px_0_#141827]">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border-[2px] border-border flex items-center justify-center">
                <Terminal size={24} className="text-text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-black text-text-primary">AI Service Unavailable</h4>
                <p className="text-xs font-bold text-text-secondary max-w-sm mt-1">
                  {aiStatus.error || "Please verify your GEMINI_API_KEY in the .env configuration to use the AI Tutor."}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const health = await checkAiHealth();
                  if (health.available) {
                    const initialPrompt = buildInitialExplanationPrompt(context);
                    const initialMessages: ChatMessage[] = [
                      { role: "system", content: GEMMA_SYSTEM_INSTRUCTION },
                      { role: "user", content: initialPrompt },
                    ];
                    setMessages(initialMessages);
                    streamResponse(initialMessages, health.activeModel);
                  }
                }}
                disabled={isCheckingHealth}
                className="mt-2 px-4 py-2 bg-primary text-text-primary border-[2px] border-border rounded-xl text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} className={isCheckingHealth ? "animate-spin" : ""} />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            <>
              {visibleMessages.length === 0 && isGenerating && (
                <div className="flex flex-col items-center justify-center my-auto p-6 gap-2 text-center text-text-secondary text-xs font-bold">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Gemini is analyzing your solution...</span>
                </div>
              )}

              {visibleMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-primary border-[1.5px] border-border flex items-center justify-center shrink-0 mt-0.5 shadow-[0_1.5px_0_#141827]">
                      <Bot size={15} />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-xl border-[2px] border-border text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-text-primary font-bold shadow-[0_2px_0_#141827]"
                        : "bg-surface text-text-primary font-medium shadow-[0_2px_0_#141827]"
                    }`}
                  >
                    {msg.content || (isGenerating ? "..." : "")}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-surface-muted border-[1.5px] border-border flex items-center justify-center shrink-0 mt-0.5 shadow-[0_1.5px_0_#141827]">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div className="p-3 rounded-xl border-[2px] border-red-500/50 bg-red-500/10 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {isGenerating && visibleMessages.length > 0 && (
                <div className="flex items-center gap-2 text-text-secondary text-xs font-bold pl-9">
                  <Loader2 size={13} className="animate-spin" />
                  <span>AI Tutor is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggested Quick Follow-Up Chips */}
        {visibleMessages.length > 0 && !isGenerating && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSendFollowUp("Can you explain why the other options are wrong?")}
              className="px-2.5 py-1 rounded-lg border-[1.5px] border-border bg-surface hover:bg-surface-muted font-bold text-text-secondary whitespace-nowrap cursor-pointer transition-all"
            >
              Why are other options wrong?
            </button>
            <button
              type="button"
              onClick={() => handleSendFollowUp("Give me a memorable real-world analogy for this concept.")}
              className="px-2.5 py-1 rounded-lg border-[1.5px] border-border bg-surface hover:bg-surface-muted font-bold text-text-secondary whitespace-nowrap cursor-pointer transition-all"
            >
              Give me a real-life analogy
            </button>
            <button
              type="button"
              onClick={() => handleSendFollowUp("Give me a quick mnemonic or trick to remember this in the exam.")}
              className="px-2.5 py-1 rounded-lg border-[1.5px] border-border bg-surface hover:bg-surface-muted font-bold text-text-secondary whitespace-nowrap cursor-pointer transition-all"
            >
              Exam memory tip
            </button>
          </div>
        )}

        {/* Footer Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendFollowUp();
          }}
          className="p-3 border-t-[2.5px] border-border bg-surface-muted flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question about this solution..."
            disabled={isGenerating || !aiStatus?.available}
            className="flex-1 px-3.5 py-2.5 rounded-xl border-[2px] border-border bg-surface text-xs font-bold text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating || !aiStatus?.available}
            className="px-4 py-2.5 bg-primary border-[2px] border-border rounded-xl text-text-primary text-xs font-black shadow-[0_2px_0_#141827] active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}

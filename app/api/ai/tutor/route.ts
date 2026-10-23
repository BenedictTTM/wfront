import { NextRequest, NextResponse } from "next/server";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_MODEL_CHAIN = [DEFAULT_GEMINI_MODEL, "gemini-3.8-flash", "gemini-3.5-flash-lite"].filter(
  (v, i, a) => a.indexOf(v) === i
);

const PREFERRED_LOCAL_MODELS = [
  "gemma4:e2b",
  "gemma4:e4b",
  "gemma4",
  "gemma2:2b",
  "gemma2",
];

// GET: Check AI service health & available models
export async function GET() {
  // 1. If Google Gemini API key is configured, return Gemini status
  if (GEMINI_API_KEY) {
    return NextResponse.json({
      available: true,
      provider: "gemini",
      activeModel: DEFAULT_GEMINI_MODEL,
      displayName: "Gemini 3.5 Flash Lite",
      models: GEMINI_MODEL_CHAIN,
    });
  }

  // 2. Otherwise fall back to checking local Ollama
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        available: false,
        error: `Ollama returned status ${res.status}`,
      });
    }

    const data = await res.json();
    const models = (data.models || []).map((m: any) => m.name);

    const activeModel =
      PREFERRED_LOCAL_MODELS.find((pm) => models.some((m: string) => m.startsWith(pm))) ||
      models[0] ||
      "gemma4:e2b";

    return NextResponse.json({
      available: true,
      provider: "ollama",
      models,
      activeModel,
      displayName: activeModel,
    });
  } catch {
    return NextResponse.json({
      available: false,
      error: "No GEMINI_API_KEY configured and local Ollama is not running.",
    });
  }
}

// POST: Stream chat completions using Google Gemini (or Ollama fallback)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model: requestedModel } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Path A: Google Gemini API
    // ---------------------------------------------------------
    if (GEMINI_API_KEY) {
      const modelToUse = requestedModel && requestedModel.startsWith("gemini")
        ? requestedModel
        : DEFAULT_GEMINI_MODEL;

      // Extract optional system instruction
      const systemMsg = messages.find((m: any) => m.role === "system");
      const systemInstruction = systemMsg?.content
        ? { parts: [{ text: systemMsg.content }] }
        : undefined;

      // Map messages to Gemini contents (roles: "user" | "model") and merge consecutive same-role turns
      const geminiContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      for (const m of messages) {
        if (m.role === "system") continue;
        const role: "user" | "model" = m.role === "assistant" ? "model" : "user";
        const text = m.content || "";
        if (!text) continue;

        const last = geminiContents[geminiContents.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += `\n\n${text}`;
        } else {
          geminiContents.push({
            role,
            parts: [{ text }],
          });
        }
      }

      if (geminiContents.length === 0) {
        return NextResponse.json(
          { error: "At least one message is required." },
          { status: 400 }
        );
      }

      if (geminiContents[0].role !== "user") {
        geminiContents.unshift({ role: "user", parts: [{ text: "Hello" }] });
      }

      const candidateModels = requestedModel && requestedModel.startsWith("gemini")
        ? [requestedModel, ...GEMINI_MODEL_CHAIN.filter((m) => m !== requestedModel)]
        : GEMINI_MODEL_CHAIN;

      let geminiRes: Response | null = null;
      let lastErrMsg = "Gemini API error";
      let lastStatus = 500;

      for (const modelCandidate of candidateModels) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

        try {
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(systemInstruction ? { systemInstruction } : {}),
              contents: geminiContents,
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
              },
            }),
          });

          if (res.ok && res.body) {
            geminiRes = res;
            break;
          }

          lastStatus = res.status;
          const errText = await res.text().catch(() => "");
          try {
            const parsed = JSON.parse(errText);
            lastErrMsg = parsed.error?.message || `Gemini API error (${res.status})`;
          } catch {
            lastErrMsg = errText || `Gemini API error (${res.status})`;
          }

          // If retryable (404 model not found or 503 high demand), try next model candidate
          if (res.status === 404 || res.status === 503 || res.status === 429) {
            continue;
          } else {
            break;
          }
        } catch (fetchErr: any) {
          lastErrMsg = fetchErr.message;
        }
      }

      if (!geminiRes || !geminiRes.body) {
        return NextResponse.json({ error: lastErrMsg }, { status: lastStatus });
      }

      // Transform Gemini SSE stream into plain text stream for the client
      const reader = geminiRes.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const jsonStr = trimmed.slice(5).trim();
                if (!jsonStr) continue;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textChunk) {
                    controller.enqueue(encoder.encode(textChunk));
                  }
                } catch {
                  // Partial or ping chunk
                }
              }
            }

            if (buffer.trim().startsWith("data:")) {
              const jsonStr = buffer.trim().slice(5).trim();
              try {
                const parsed = JSON.parse(jsonStr);
                const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
                }
              } catch {
                // Ignore
              }
            }

            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // ---------------------------------------------------------
    // Path B: Fallback to local Ollama service
    // ---------------------------------------------------------
    const modelToUse = requestedModel || process.env.LOCAL_AI_MODEL || "gemma4:e2b";

    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        stream: true,
        options: {
          temperature: 0.7,
          topP: 0.9,
        },
      }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Ollama error (${ollamaRes.status}): ${errText || "Model unavailable"}`,
        },
        { status: ollamaRes.status }
      );
    }

    if (!ollamaRes.body) {
      return NextResponse.json(
        { error: "No response stream from local model." },
        { status: 500 }
      );
    }

    const reader = ollamaRes.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const parsed = JSON.parse(trimmed);
                const token = parsed.message?.content || "";
                if (token) {
                  controller.enqueue(encoder.encode(token));
                }
              } catch {
                // Ignore
              }
            }
          }

          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              const token = parsed.message?.content || "";
              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // Ignore
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.message ||
          "Could not connect to AI tutor service.",
      },
      { status: 503 }
    );
  }
}

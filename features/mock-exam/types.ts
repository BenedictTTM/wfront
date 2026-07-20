// features/mock-exam — timed exam session, heartbeat, state machine, reconnect
// State: in_progress ⇄ disconnected_grace → auto_submitted | completed
// TODO: implement — confirm polling vs. WebSocket (architecture doc §5.3 ⚠️ TODO)
export type MockExamAttempt = {
  id: string;
  status: "in_progress" | "disconnected_grace" | "auto_submitted" | "completed";
  remainingSeconds: number; // server-authoritative, never a local countdown
  // TODO: confirm full shape
};

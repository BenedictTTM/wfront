// MockExamSessionPage — timed mock exam session with heartbeat and reconnect logic
// State machine: in_progress ⇄ disconnected_grace → auto_submitted | completed
// Feature logic lives in features/mock-exam/ (state machine + heartbeat)
export default function MockExamSessionPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return null;
}

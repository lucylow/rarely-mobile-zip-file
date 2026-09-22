export type AiTask = "creative" | "mood" | "recommend";

export type AiRequest = {
  task: AiTask;
  requestId: string;
  context: Record<string, unknown>;
  userConsented: boolean;
};

export type AiSafetyResult = {
  allowed: boolean;
  flags: string[];
};

export type AiResult<T> = {
  requestId: string;
  task: AiTask;
  data: T;
  safety: AiSafetyResult;
};

export function isAiRequest(value: unknown): value is AiRequest {
  if (typeof value !== "object" || value === null) return false;
  const request = value as Partial<AiRequest>;
  return (
    typeof request.requestId === "string" && request.requestId.trim().length > 0 &&
    (request.task === "creative" || request.task === "mood" || request.task === "recommend") &&
    typeof request.context === "object" && request.context !== null &&
    typeof request.userConsented === "boolean"
  );
}

import type { User } from "@interfaces/auth";

const SESSION_CHANNEL_NAME = "mern-template:session";

export type SessionSyncMessage = { type: "login"; user: User } | { type: "logout" };

const channel =
  typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel(SESSION_CHANNEL_NAME) : null;

export function broadcastSession(message: SessionSyncMessage): void {
  channel?.postMessage(message);
}

export function subscribeToSession(handler: (message: SessionSyncMessage) => void): () => void {
  if (!channel) return () => undefined;

  const listener = (event: MessageEvent<SessionSyncMessage>) => {
    handler(event.data);
  };

  channel.addEventListener("message", listener);
  return () => {
    channel.removeEventListener("message", listener);
  };
}

export type DatabaseState = "disconnected" | "connected" | "connecting" | "disconnecting";

export type DatabaseHealth =
  { readonly status: "connected" } | { readonly status: Exclude<DatabaseState, "connected"> };

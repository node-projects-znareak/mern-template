import type { PublicUser } from "@models/user";

import type { UserId } from "./brand";

export interface UserSession {
  readonly user: PublicUser;
  readonly userId: UserId;
  readonly token: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      session?: UserSession;
      files?: unknown;
    }
  }
}

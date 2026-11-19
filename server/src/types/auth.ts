export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface SignupInput extends LoginInput {
  readonly name: string;
}

export interface ChangePasswordInput {
  readonly password: string;
  readonly passwordConfirm: string;
}

export interface EmailAvailabilityResult {
  readonly email: string;
  readonly available: boolean;
  readonly inUse: boolean;
}

export interface UserJwtPayload {
  readonly _id: string;
  readonly email: string;
  readonly name: string;
}

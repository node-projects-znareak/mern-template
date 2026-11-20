export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface SignupInput extends LoginInput {
  readonly name: string;
}

export interface ChangePasswordInput {
  readonly currentPassword: string;
  readonly password: string;
  readonly passwordConfirm: string;
}

export interface EmailAvailabilityResult {
  readonly email: string;
  readonly available: boolean;
  readonly inUse: boolean;
}

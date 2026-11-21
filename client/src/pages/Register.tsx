import classNames from "classnames";
import { Lock, Mail, User } from "lucide-react";
import ViewTransitionLink from "@/components/routes/ViewTransitionLink";
import AuthShell from "@/components/auth/AuthShell";
import { AuthInput, AuthPasswordInput } from "@/components/auth/AuthFields";
import { EmailStatusIndicator } from "@/components/ui/EmailStatusIndicator";
import { PasswordRequirementsTooltip } from "@/components/ui/PasswordRequirementsTooltip";
import useSignup from "@/hooks/auth/useSignup";
import { useEmailValidation } from "@/hooks/form/useEmailValidation";
import { useRegisterLogic } from "@/hooks/form/useRegisterLogic";
import { parseError } from "@/utils/http";
import { getPasswordStrength } from "@/utils/helpers";

const Register = () => {
  const { onFinish, error, isLoading } = useSignup();
  const { setEmail, isChecking, canSubmit, message, hasError, hasSuccess, isNetworkError } = useEmailValidation();

  const {
    formData,
    handleChange,
    handleEmailInputBlur,
    handlePasswordConfirmChange,
    handleSubmit,
    isFormValid,
    hasUserInteracted,
    passwordValidation: {
      showPasswordMismatch,
      showConfirmPasswordRequired,
      handlePasswordConfirmFocus,
      handlePasswordConfirmBlur,
      handlePasswordBlur,
    },
  } = useRegisterLogic({
    hasSuccess,
    canSubmit,
    setEmail,
    onFinish,
  });

  const strength = getPasswordStrength(formData.password);

  return (
    <AuthShell activeTab="register">
      {!!error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {parseError(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="view-transition-card space-y-3" autoComplete="off">
        <AuthInput
          type="text"
          name="name"
          placeholder="Name"
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <div className="space-y-1">
          <AuthInput
            type="email"
            name="email"
            placeholder="Email"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailInputBlur}
            disabled={isLoading}
            required
            className={classNames({
              "border-green-500 focus:border-green-500 focus:ring-green-500": hasSuccess,
              "border-red-500 focus:border-red-500 focus:ring-red-500": hasError,
            })}
          />

          <EmailStatusIndicator
            isChecking={isChecking}
            message={message}
            hasError={hasError}
            hasSuccess={hasSuccess}
            isNetworkError={isNetworkError}
          />
        </div>

        <div className="space-y-1">
          <div className="relative">
            <AuthPasswordInput
              name="password"
              placeholder="Password"
              icon={<Lock className="h-4 w-4" aria-hidden="true" />}
              value={formData.password}
              onChange={handleChange}
              onBlur={handlePasswordBlur}
              minLength={8}
              disabled={isLoading}
              required
            />

            <div className="absolute right-9 top-1/2 -translate-y-1/2 flex items-center">
              <PasswordRequirementsTooltip password={formData.password} />
            </div>
          </div>

          <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={classNames(
                "relative h-full rounded-full origin-left transition-[width,background-color] duration-500 ease-out",
                strength.color
              )}
              style={{
                width: formData.password
                  ? `${strength.label === "Weak" ? 33 : strength.label === "Medium" ? 66 : 100}%`
                  : "0%",
              }}
            >
              {!!formData.password && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[strength-shimmer_1.6s_ease-in-out_infinite]"
                />
              )}
            </div>
          </div>
          {!!formData.password && (
            <div
              key={strength.label}
              className={classNames("text-xs mt-1 animate-fade-up-in", {
                "text-red-400": strength.label === "Weak",
                "text-yellow-400": strength.label === "Medium",
                "text-green-400": strength.label === "Strong",
              })}
            >
              {strength.label}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <AuthPasswordInput
            name="passwordConfirm"
            placeholder="Confirm password"
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            value={formData.passwordConfirm}
            onChange={handlePasswordConfirmChange}
            onFocus={handlePasswordConfirmFocus}
            onBlur={handlePasswordConfirmBlur}
            minLength={8}
            disabled={isLoading}
            required
            className={classNames({
              "border-red-500 focus:border-red-500 focus:ring-red-500":
                showPasswordMismatch || showConfirmPasswordRequired,
            })}
          />

          {!!showPasswordMismatch && <div className="text-xs text-red-400 mt-1">Passwords do not match</div>}
          {!!showConfirmPasswordRequired && (
            <div className="text-xs text-red-400 mt-1">Please confirm your password</div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0075FF] hover:bg-[#0066e0] active:scale-[0.99] text-white text-sm font-semibold tracking-normal transition duration-150 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? "Signing up..." : "Create account with Brainwave"}
        </button>

        {!isFormValid() && !isLoading && !!hasUserInteracted && (
          <div className="text-xs text-red-400 text-center -mt-3 font-medium">
            {!hasSuccess && formData.email
              ? "Please verify that the email is available before continuing"
              : "Complete all fields correctly to continue"}
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <ViewTransitionLink
              to="/login"
              className="text-[#0075FF] hover:text-blue-400 font-medium hover:underline"
            >
              Log in here
            </ViewTransitionLink>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default Register;

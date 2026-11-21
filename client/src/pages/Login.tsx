import { Lock, Mail } from "lucide-react";
import ViewTransitionLink from "@/components/routes/ViewTransitionLink";
import AuthShell from "@/components/auth/AuthShell";
import { AuthInput, AuthPasswordInput } from "@/components/auth/AuthFields";
import { parseError } from "@/utils/http";
import useUserLogin from "@/hooks/auth/useLogin";
import { useLoginForm } from "@/hooks/auth/useLoginForm";

const Login = () => {
  const { onFinish, error, isLoading } = useUserLogin();
  const { emailError, passwordError, handleEmailChange, handlePasswordChange, handleSubmit } = useLoginForm();

  return (
    <AuthShell activeTab="login">
      {!!error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {parseError(error)}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, onFinish)} className="view-transition-card space-y-3" autoComplete="off">
        <div className="space-y-1">
          <AuthInput
            type="email"
            name="email"
            placeholder="Username or email"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            disabled={isLoading}
            onChange={handleEmailChange}
          />
          {!!emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
        </div>

        <div className="space-y-1">
          <AuthPasswordInput
            name="password"
            placeholder="Password"
            icon={<Lock className="h-4 w-4" aria-hidden="true" />}
            minLength={8}
            disabled={isLoading}
            onChange={handlePasswordChange}
          />
          {!!passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
        </div>

        <div className="pt-0.5 text-left">
          <ViewTransitionLink
            to="/forgot-password"
            className="text-xs text-[#0075FF] hover:text-blue-400 font-medium transition duration-150"
          >
            Forgot password?
          </ViewTransitionLink>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0075FF] hover:bg-[#0066e0] active:scale-[0.99] text-white text-sm font-semibold tracking-normal transition duration-150 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? "Logging in..." : "Sign in with Brainwave"}
        </button>

        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <ViewTransitionLink
              to="/register"
              className="text-[#0075FF] hover:text-blue-400 font-medium hover:underline"
            >
              Sign up here
            </ViewTransitionLink>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default Login;

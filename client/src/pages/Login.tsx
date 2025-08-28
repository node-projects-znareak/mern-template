import useUserLogin from "@/hooks/auth/useLogin";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseError } from "@/utils/http";
import { useLoginForm } from "@/hooks/auth/useLoginForm";

const Login = () => {
  const { onFinish, error, isLoading } = useUserLogin();
  const {
    emailError,
    passwordError,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-80 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="text-sm text-muted-foreground">Access your account</p>
        </div>

        {!!error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{parseError(error)}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={e => handleSubmit(e, onFinish)} className="space-y-4" autoComplete="off">
          <div className="space-y-1">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              disabled={isLoading}
              onChange={handleEmailChange}
            />
            {!!emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <div className="space-y-1">
            <PasswordInput
              name="password"
              placeholder="Password"
              minLength={8}
              disabled={isLoading}
              onChange={handlePasswordChange}
            />
            {!!passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Login;

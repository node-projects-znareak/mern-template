import useUserLogin from "@/hooks/useLogin";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseError } from "@/utils/http";

const Login = () => {
  const { onFinish, error, isLoading } = useUserLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.email as HTMLInputElement).value.trim();
    const password = (form.password as HTMLInputElement).value;

    if (!email || !email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email");
      return;
    }

    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    onFinish({ email, password });
  };

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

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input type="email" name="email" placeholder="Email" disabled={isLoading} required />
          <PasswordInput name="password" placeholder="Password" minLength={8} disabled={isLoading} required />

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

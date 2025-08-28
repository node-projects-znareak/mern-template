import { Link } from "react-router-dom";
import classNames from "classnames";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailStatusIndicator } from "@/components/ui/EmailStatusIndicator";
import { PasswordRequirementsTooltip } from "@/components/ui/PasswordRequirementsTooltip";
import useSignup from "@/hooks/auth/useSignup";
import { useEmailValidation } from "@/hooks/form/useEmailValidation";
import { useRegisterLogic } from "@/hooks/form/useRegisterLogic";
import { parseError } from "@/utils/http";
import { getPasswordStrength } from "@/utils/helpers";

const Register = () => {
  const { onFinish, error, isLoading } = useSignup();
  const { 
    setEmail,
    isChecking,
    canSubmit,
    message,
    hasError,
    hasSuccess,
    isNetworkError
  } = useEmailValidation();

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Sign up</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        {!!error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{parseError(error)}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />

          <div className="space-y-1">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailInputBlur}
              disabled={isLoading}
              required
              className={classNames({
                "border-green-500 focus:border-green-500": hasSuccess,
                "border-red-500 focus:border-red-500": hasError,
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
              <PasswordInput
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handlePasswordBlur}
                minLength={8}
                disabled={isLoading}
                required
                className="pr-10"
              />
              
              <div className="absolute right-8 top-1/2 mt-0.5 transform -translate-y-1/2">
                <PasswordRequirementsTooltip password={formData.password} />
              </div>
            </div>
            
            <div className="h-2 w-full rounded bg-muted">
              <div
                className={classNames("h-2 rounded transition-all duration-300", strength.color)}
                style={{
                  width: formData.password
                    ? `${strength.label === "Weak" ? 33 : strength.label === "Medium" ? 66 : 100}%`
                    : "0%",
                }}
              />
            </div>
            {formData.password && (
              <div
                className={classNames("text-xs mt-1", {
                  "text-red-500": strength.label === "Weak",
                  "text-yellow-400": strength.label === "Medium",
                  "text-green-500": strength.label === "Strong",
                })}
              >
                {strength.label}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <PasswordInput
              name="passwordConfirm"
              placeholder="Confirm password"
              value={formData.passwordConfirm}
              onChange={handlePasswordConfirmChange}
              onFocus={handlePasswordConfirmFocus}
              onBlur={handlePasswordConfirmBlur}
              minLength={8}
              disabled={isLoading}
              required
              className={classNames({
                "border-red-500 focus:border-red-500": showPasswordMismatch,
              })}
            />

            {showPasswordMismatch && <div className="text-xs text-red-500 mt-1">Passwords do not match</div>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !isFormValid()}>
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>

          {!isFormValid() && !isLoading && hasUserInteracted && (
            <div className="text-xs text-red-500 text-center -mt-3 font-medium">
              {!hasSuccess && formData.email ? 
                "Please verify that the email is available before continuing" : 
                "Complete all fields correctly to continue"
              }
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

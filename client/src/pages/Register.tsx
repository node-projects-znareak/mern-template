import { Link } from "react-router-dom";
import classNames from "classnames";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailStatusIndicator } from "@/components/ui/EmailStatusIndicator";
import { UsernameStatusIndicator } from "@/components/ui/UsernameStatusIndicator";
import { PasswordRequirementsTooltip } from "@/components/ui/PasswordRequirementsTooltip";
import useSignup from "@/hooks/auth/useSignup";
import { useRegisterFormWithValidation } from "@/hooks/form/useRegisterFormWithValidation";
import { parseError } from "@/utils/http";
import { getPasswordStrength } from "@/utils/helpers";

const Register = () => {
  const { onFinish, error, isLoading } = useSignup();
  
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isFormReady,
    formValues: { email, username, password },
    emailValidation: {
      handleEmailBlur,
      isCheckingEmail,
      emailMessage,
      hasEmailError,
      hasEmailSuccess,
      isEmailNetworkError,
    },
    usernameValidation: {
      handleUsernameBlur,
      isCheckingUsername,
      usernameMessage,
      hasUsernameError,
      hasUsernameSuccess,
      isUsernameNetworkError,
    },
  } = useRegisterFormWithValidation(onFinish);

  const strength = getPasswordStrength(password);

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
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="Username"
              disabled={isLoading || isSubmitting}
              {...register("username")}
              onBlur={handleUsernameBlur}
              className={classNames({
                "border-green-500 focus:border-green-500": hasUsernameSuccess && !errors.username,
                "border-red-500 focus:border-red-500": hasUsernameError || !!errors.username,
              })}
            />

            {!!errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}

            <UsernameStatusIndicator
              isChecking={isCheckingUsername}
              message={usernameMessage}
              hasError={hasUsernameError ?? false}
              hasSuccess={hasUsernameSuccess}
              isNetworkError={isUsernameNetworkError}
            />
          </div>

          <div className="space-y-1">
            <Input
              type="email"
              placeholder="Email"
              disabled={isLoading || isSubmitting}
              {...register("email")}
              onBlur={handleEmailBlur}
              className={classNames({
                "border-green-500 focus:border-green-500": hasEmailSuccess && !errors.email,
                "border-red-500 focus:border-red-500": hasEmailError || !!errors.email,
              })}
            />

            {!!errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}

            <EmailStatusIndicator
              isChecking={isCheckingEmail}
              message={emailMessage}
              hasError={hasEmailError ?? false}
              hasSuccess={hasEmailSuccess}
              isNetworkError={isEmailNetworkError}
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <PasswordInput
                placeholder="Password"
                disabled={isLoading || isSubmitting}
                {...register("password")}
                minLength={8}
                className={classNames("pr-10", {
                  "border-red-500 focus:border-red-500": !!errors.password,
                })}
              />
              
              <div className="absolute right-8 top-1/2 mt-0.5 transform -translate-y-1/2">
                <PasswordRequirementsTooltip password={password} />
              </div>
            </div>

            {!!errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
            
            <div className="h-2 w-full rounded bg-muted">
              <div
                className={classNames("h-2 rounded transition-all duration-300", strength.color)}
                style={{
                  width: password
                    ? `${strength.label === "Weak" ? 33 : strength.label === "Medium" ? 66 : 100}%`
                    : "0%",
                }}
              />
            </div>
            {!!password && (
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
              placeholder="Confirm password"
              disabled={isLoading || isSubmitting}
              {...register("passwordConfirm")}
              minLength={8}
              className={classNames({
                "border-red-500 focus:border-red-500": !!errors.passwordConfirm,
              })}
            />

            {!!errors.passwordConfirm && (
              <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isSubmitting || !isFormReady}
          >
            {isLoading || isSubmitting ? "Signing up..." : "Sign up"}
          </Button>

          {(!isFormReady && !isLoading && !isSubmitting && (!!email || !!username)) && (
            <div className="text-xs text-red-500 text-center -mt-3 font-medium">
              {(!hasEmailSuccess && email) || (!hasUsernameSuccess && username) ? 
                "Please verify that the email and username are available before continuing" : 
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

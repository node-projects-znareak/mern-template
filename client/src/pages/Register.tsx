import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useSignup from "@/hooks/useSignup";
import { useCheckEmail } from "@/hooks/useCheckEmail";
import { parseError } from "@/utils/http";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-z0-9]/i.test(password)) score++; // Usar bandera 'i' para simplificar
  if (password.length >= 12) score++;
  if (score <= 2) return { color: "bg-red-500", label: "Weak" };
  if (score <= 4) return { color: "bg-yellow-400", label: "Medium" };
  return { color: "bg-green-500", label: "Strong" };
}

const Register = () => {
  const { onFinish, error, isLoading } = useSignup();
  const { checkEmail, isChecking, error: emailError, clearError } = useCheckEmail();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
  });

  const [emailStatus, setEmailStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({
    checked: false,
    available: false,
    message: "",
  });

  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
    };
  }, [emailCheckTimeout]);

  const handleEmailCheck = useCallback(async (email: string) => {
    if (!email || !email.includes("@")) {
      setEmailStatus({
        checked: false,
        available: false,
        message: "",
      });
      return;
    }

    const result = await checkEmail(email);
    if (result) {
      setEmailStatus({
        checked: true,
        available: result.available,
        message: result.available 
          ? "✓ Email disponible" 
          : "✗ Este email ya está registrado",
      });
    }
  }, [checkEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Si el campo es email, verificar disponibilidad con debounce
    if (name === "email") {
      // Limpiar el timeout anterior
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }

      // Limpiar errores previos
      clearError();
      
      // Reset email status
      setEmailStatus({
        checked: false,
        available: false,
        message: "",
      });

      // Si el email es válido, programar verificación
      if (value && value.includes("@") && value.includes(".")) {
        const timeout = setTimeout(() => {
          handleEmailCheck(value);
        }, 800); // 800ms de debounce
        setEmailCheckTimeout(timeout);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!formData.email || !formData.email.includes("@") || !formData.email.includes(".")) {
      alert("Please enter a valid email");
      return;
    }

    // Verificar si el email está disponible
    if (emailStatus.checked && !emailStatus.available) {
      alert("Este email ya está registrado. Por favor, usa otro.");
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      alert("Password must contain uppercase, lowercase letters and a number");
      return;
    }

    onFinish(formData);
  };

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
              disabled={isLoading}
              required
              className={
                emailStatus.checked
                  ? emailStatus.available
                    ? "border-green-500 focus:border-green-500"
                    : "border-red-500 focus:border-red-500"
                  : ""
              }
            />
            
            {/* Estado de verificación del email */}
            {isChecking && (
              <div className="text-xs text-blue-600 flex items-center">
                <span className="animate-pulse">Verificando email...</span>
              </div>
            )}
            
            {emailError && (
              <div className="text-xs text-red-600">
                {emailError}
              </div>
            )}
            
            {emailStatus.checked && (
              <div 
                className={`text-xs ${
                  emailStatus.available ? "text-green-600" : "text-red-600"
                }`}
              >
                {emailStatus.message}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <PasswordInput
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              disabled={isLoading}
              required
            />
            <div className="h-2 w-full rounded bg-muted">
              <div
                className={`h-2 rounded transition-all duration-300 ${strength.color}`}
                style={{
                  width: formData.password
                    ? `${strength.label === "Weak" ? 33 : strength.label === "Medium" ? 66 : 100}%`
                    : "0%",
                }}
              />
            </div>
            {formData.password && (
              <div className="text-xs mt-1" style={{ color: strength.color.replace("bg-", "").replace("-500", "") }}>
                {strength.label}
              </div>
            )}
          </div>

          <PasswordInput
            name="passwordConfirm"
            placeholder="Confirm password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            minLength={8}
            disabled={isLoading}
            required
          />

          <p className="text-xs text-muted-foreground text-center">
            Password must contain uppercase, lowercase letters and a number
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>

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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/schemas/auth";

export const useLoginForm = (onSubmit: (data: LoginFormData) => void) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Valida cuando el usuario sale del campo
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchedValues = watch();

  const onFormSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Login form submission error:", error);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onFormSubmit),
    errors,
    isSubmitting,
    isDirty,
    isValid,
    reset,
    formData: watchedValues,
  };
};

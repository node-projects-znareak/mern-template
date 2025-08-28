import { useState } from "react";

interface FormData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
  });

  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (!hasUserInteracted && value.length > 0) {
      setHasUserInteracted(true);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
    });
    setHasUserInteracted(false);
  };

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
    hasUserInteracted,
  };
};

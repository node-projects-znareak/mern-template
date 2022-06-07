import { useState } from "react";

export default function useCaptcha(captchaRef) {
  const [isValidCaptcha, setIsValidCaptcha] = useState(false);
  const captchaInvalid = () => setIsValidCaptcha(false);
  const captchaValid = () => setIsValidCaptcha(true);

  function handleChangeCaptcha() {
    if (captchaRef.current.getValue()) return setIsValidCaptcha(true);
    setIsValidCaptcha(false);
  }

  function handleExpireCaptcha() {
    setIsValidCaptcha(false);
  }
  return {
    isValidCaptcha,
    setIsValidCaptcha,
    captchaInvalid,
    captchaValid,
    
    handleChangeCaptcha,
    handleExpireCaptcha,
  };
}

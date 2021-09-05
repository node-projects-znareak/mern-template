import { forwardRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptcha_key } from "../config/config";

const Captcha = (props, ref) => {
  return (
    <ReCAPTCHA ref={ref} sitekey={recaptcha_key} theme="dark" {...props} />
  );
};

export default forwardRef(Captcha);

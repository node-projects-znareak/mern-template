import { forwardRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptcha_key } from "../config/config";

function Captcha(props, ref) {
  return <ReCAPTCHA ref={ref} sitekey={recaptcha_key} {...props}></ReCAPTCHA>;
}

export default forwardRef(Captcha);

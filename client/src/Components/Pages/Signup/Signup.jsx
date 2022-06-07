import useBody from "../../Hooks/useBody";
import css from "../Style.module.scss";
import useSignup from "../../Hooks/useSignup";
import Btn from "../../Elements/Btn";
import ErrorText from "../../Elements/ErrorText";
import Captcha from "../../Captcha";
import useCaptcha from "../../Hooks/useCaptcha";
import { Oval } from "react-loader-spinner";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BiUser, BiEnvelope, BiKey } from "react-icons/bi";

const cssBody = {
  backgroundSize: "cover",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Signup() {
  useBody(cssBody);
  const captchaRef = useRef(null);
  const signup = useSignup();
  const navigate = useNavigate();
  const { isValidCaptcha, handleChangeCaptcha, handleExpireCaptcha } = useCaptcha(captchaRef);
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
  });
  
  function handleOnChange({ target }) {
    const { name, value } = target;
    setAuth((a) => ({ ...a, [name]: value }));
  }

  async function handleOnSubmit(e) {
    e.preventDefault();
    if (!isValidCaptcha) return;

    const res = await signup.mutateAsync(auth);
    if (res.ok) {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className={css.container}>
      <h2 style={{ marginBottom: "1rem" }}>Registrate</h2>

      <form onSubmit={handleOnSubmit}>
        <div className="group">
          <BiUser className="groupIcon" />
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            onChange={handleOnChange}
            value={auth.name}
            autoComplete="on"
            required
          />
        </div>
        <div className="group">
          <BiEnvelope className="groupIcon" />
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            onChange={handleOnChange}
            value={auth.user}
            autoComplete="on"
            required
          />
        </div>

        <div className="group">
          <BiKey className="groupIcon" />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={auth.password}
            onChange={handleOnChange}
            autoComplete="on"
            required
          />
        </div>
        <div className="group">
          <BiKey className="groupIcon" />
          <input
            type="password"
            name="passwordConfirm"
            id="passwordConfirm"
            placeholder="Password Confirm"
            value={auth.passwordConfirm}
            onChange={handleOnChange}
            required
          />
        </div>
        <small className={css.lead} style={{ fontSize: "80%" }}>
          La clave debe tener letras mayúsculas, minúsculas y un número
        </small>

        <ErrorText isVisible={signup.isError} text={signup} />

        <div className="group">
          <Captcha
            ref={captchaRef}
            onChange={handleChangeCaptcha}
            onExpired={handleExpireCaptcha}
          />
        </div>

        <div className="group">
          <Btn type="submit" disabled={signup.isLoading || !isValidCaptcha}>
            <div className={css.buttonContent}>
              <span>Registrarse</span>
              {signup.isLoading && (
                <Oval height={20} width={20} color="#fff" visible />
              )}
            </div>
          </Btn>
          <small className={css.lead} style={{ fontSize: "80%" }}>
            Si ya tienes cuenta, entra <Link to="/">aca</Link>.
          </small>
        </div>
      </form>
    </div>
  );
}

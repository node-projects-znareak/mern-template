import useBody from "../../Hooks/useBody";
import css from "../Style.module.scss";
import useLogin from "../../Hooks/useLogin";
import useCurrentUser from "../../Hooks/useCurrentUser";
import Btn from "../../Elements/Btn";
import ErrorText from "../../Elements/ErrorText";
import Captcha from "../../Captcha";
import useCaptcha from "../../Hooks/useCaptcha";
import { useNavigate, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { Oval } from "react-loader-spinner";
import { BiEnvelope, BiKey } from "react-icons/bi";
import { setToken } from "../../../Helpers/token";

const cssBody = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Login() {
  useBody(cssBody);

  const captchaRef = useRef(null);
  const login = useLogin();
  const navigate = useNavigate();
  const { setUser } = useCurrentUser();
  const { isValidCaptcha, handleChangeCaptcha, handleExpireCaptcha } =useCaptcha(captchaRef);
  const [auth, setAuth] = useState({ email: "", password: "" });

  function handleOnChange({ target }) {
    const { name, value } = target;
    setAuth((a) => ({ ...a, [name]: value }));
  }

  async function handleOnSubmit(e) {
    e.preventDefault();
    if (!isValidCaptcha) return;

    const res = await login.mutateAsync(auth);
    if (res.ok) {
      setUser(res.data.user);
      setToken(res.data.token);
      navigate("/home", { replace: true });
    }
  }

  return (
    <div className={css.container}>
      <h2>Inicia Sesión</h2>
      <p className={css.lead}>
        Necesitas tener una cuenta para acceder al contenido de esta página.
      </p>

      <form onSubmit={handleOnSubmit}>
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
        <ErrorText isVisible={login.isError} text={login} />

        <div className="group">
          <Captcha
            ref={captchaRef}
            onChange={handleChangeCaptcha}
            onExpired={handleExpireCaptcha}
          />
        </div>

        <div className="group">
          <Btn type="submit" disabled={login.isLoading || !isValidCaptcha}>
            <div className={css.buttonContent}>
              <span>Iniciar</span>
              {login.isLoading && (
                <Oval height={20} width={20} color="#fff" visible />
              )}
            </div>
          </Btn>
          <small className={css.lead} style={{ fontSize: "80%" }}>
            Si no tienes cuenta, puedes crearla <Link to="/signup">aca</Link>.
          </small>
        </div>
      </form>
    </div>
  );
}

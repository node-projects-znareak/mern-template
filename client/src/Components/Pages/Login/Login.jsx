import useBody from "../../Hooks/useBody";
import css from "../Style.module.scss";
import { useState, useRef } from "react";
import Loader from "react-loader-spinner";
import { BiEnvelope, BiKey } from "react-icons/bi";
import useAuth from "../../Hooks/useAuth";
import { useHistory, Link } from "react-router-dom";
import { setToken } from "../../../Helpers/token";
import Btn from "../../Elements/Btn";
import ErrorText from "../../Elements/ErrorText";
import useCurrentUser from "../../Hooks/useCurrentUser";
import Captcha from "../../Captcha";

const cssBody = {
  backgroundSize: "cover",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Login() {
  useBody(cssBody);
  const { setUser } = useCurrentUser();
  const [isValidCaptcha, setIsValidCaptcha] = useState(false);
  const [auth, setAuth] = useState({ email: "", password: "" });
  const captchaRef = useRef(null);
  const login = useAuth();
  const { push } = useHistory();

  function handleOnChange({ target }) {
    const { name, value } = target;
    setAuth((a) => ({ ...a, [name]: value }));
  }

  async function handleOnSubmit(e) {
    e.preventDefault();
    if (!isValidCaptcha) return;

    const res = await login.mutateAsync(auth);

    if (res.ok) {
      setToken(res.data.token);
      setUser(res.data.user);
      push("/home");
    }
  }

  function handleChangeCaptcha() {
    if (captchaRef.current.getValue()) {
      setIsValidCaptcha(true);
    } else {
      setIsValidCaptcha(false);
    }
  }

  function handleExpireCaptcha() {
    setIsValidCaptcha(false);
  }

  return (
    <div className={css.container}>
      <h2>Inicia Sesión</h2>
      <p className={css.lead}>
        Necesitas tener una cuenta para acceder al contenido de esta página.
      </p>

      <form autoComplete="off" onSubmit={handleOnSubmit}>
        <div className="group">
          <BiEnvelope className="groupIcon" />
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            onChange={handleOnChange}
            value={auth.user}
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
            required
          />
        </div>
        <ErrorText
          isVisible={login.isError}
          text="Ocurrió un error, verifica tus datos."
        />

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
                <Loader height={20} width={20} color="#fff" type="Oval" />
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

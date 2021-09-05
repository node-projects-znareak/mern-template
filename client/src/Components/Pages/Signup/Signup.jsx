import useBody from "../../Hooks/useBody";
import css from "../Style.module.scss";
import { useState, useRef } from "react";
import Loader from "react-loader-spinner";
import { BiUser, BiEnvelope, BiKey } from "react-icons/bi";
import useAuth from "../../Hooks/useAuth";
import { useHistory, Link } from "react-router-dom";
import Btn from "../../Elements/Btn";
import ErrorText from "../../Elements/ErrorText";
import Captcha from "../../Captcha";
import { signupUser } from "../../../Helpers/api";

const cssBody = {
  backgroundSize: "cover",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Signup() {
  useBody(cssBody);
  const [isValidCaptcha, setIsValidCaptcha] = useState(false);
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
  });
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

    const res = await signupUser(auth);
    if (res.ok) push("/");
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
      <h2 style={{ marginBottom: "1rem" }}>Registrate</h2>

      <form autoComplete="off" onSubmit={handleOnSubmit}>
        <div className="group">
          <BiUser className="groupIcon" />
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            onChange={handleOnChange}
            value={auth.name}
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
        <small className={css.lead}>
          La clave sólo debe tener letras mayúsculas, minúsculas y un número
        </small>
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
              <span>Registrarse</span>
              {login.isLoading && (
                <Loader height={20} width={20} color="#fff" type="Oval" />
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

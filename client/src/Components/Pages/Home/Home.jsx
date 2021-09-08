import React from "react";
import Btn from "../../Elements/Btn";
import css from "../../../Style/Home.module.scss";
import useCurrentUser from "../../Hooks/useCurrentUser";
import { testApi } from "../../../Helpers/api";

export default function Home() {
  const { logout, user } = useCurrentUser();
  return (
    <div className={css.container}>
      <h2>Bivenido {user.name}</h2>
      <h3>Tu rol es {user.isAdmin ? "administrador" : "usuario"}</h3>
      <br />
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem
        placeat dolor nulla expedita voluptatem temporibus dolorem id hic
        voluptatum facere velit, est debitis ipsam deserunt nam illum veritatis
        excepturi in?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem
        placeat dolor nulla expedita voluptatem temporibus dolorem id hic
        voluptatum facere velit, est debitis ipsam deserunt nam illum veritatis
        excepturi in?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem
        placeat dolor nulla expedita voluptatem temporibus dolorem id hic
        voluptatum facere velit, est debitis ipsam deserunt nam illum veritatis
        excepturi in?
      </p>

      <p>
        <strong>
          Si el token caducó o es incorrecta, se redirecciona al login
        </strong>
      </p>

      <div style={{ display: "flex" }}>
        <Btn onClick={logout} style={{ width: "50%", margin: "0 2px" }}>
          Salir de la cuenta
        </Btn>

        <Btn onClick={testApi} style={{ width: "50%", margin: "0 2px" }}>
          Verificar sesión
        </Btn>
      </div>
    </div>
  );
}

import React from "react";
import Btn from "../../Elements/Btn";
import css from "../../../Style/Home.module.scss";
import useCurrentUser from "../../Hooks/useCurrentUser";

export default function Home() {
  const { logout, user } = useCurrentUser();
  console.log("Home component");
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

      <Btn onClick={logout}>Salir de la cuenta</Btn>
    </div>
  );
}

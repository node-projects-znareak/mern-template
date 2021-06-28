import React from "react";
import Btn from "../../Elements/Btn";
import useUserInfo from "../../Hooks/useUserInfo";
import css from "../../../Style/Home.module.scss";

export default function Home() {
  const { logout } = useUserInfo();
  console.log("Home component");
  return (
    <div className={css.container}>
      <h2>Esto es la home</h2>
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

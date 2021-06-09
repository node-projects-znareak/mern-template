import React from "react";
import sessionError from "../../../Images/session_error.svg";
import Btn from "../../Elements/Btn";
import css from "./SessionError.module.scss";

export default function SessionError() {
  const reload = () => window.location.reload();
  return (
    <div className={css.container}>
      <img src={sessionError} alt="" className={css.image} />
      <h2>Error in downloading your account info.</h2>
      <ul>
        <li>Verify your network connection</li>
        <li>Delete your browser history and cache</li>
        <li>Verify your VPN or proxy configuration</li>
        <li>Report this here</li>
      </ul>
      <Btn text="Reload browser" onClick={reload} />
    </div>
  );
}

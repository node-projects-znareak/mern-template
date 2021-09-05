import { memo } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { getErrorValidation } from "../../Helpers/utils";

function ErrorText({ isVisible, text = "Ocurrió un error.", ...props }) {
  const innerText = typeof text === "string" ? text : getErrorValidation(text);
  return isVisible ? (
    <div
      {...props}
      style={{ display: "flex", alignContent: "center", marginBottom: "1rem" }}
    >
      <BiErrorCircle style={{ fill: "#ff005c" }} />
      <small>
        <span style={{ color: "#ff005c", marginLeft: "5px" }}>{innerText}</span>
      </small>
    </div>
  ) : null;
}

export default memo(ErrorText);

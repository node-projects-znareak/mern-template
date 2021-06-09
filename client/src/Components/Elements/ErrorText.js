import { memo } from "react";
import { BiErrorCircle } from "react-icons/bi";

function ErrorText({ isVisible, text = "Ocurrió un error.", ...props }) {
  return isVisible ? (
    <div
      {...props}
      style={{ display: "flex", alignContent: "center", marginBottom: "1rem" }}
    >
      <BiErrorCircle style={{ fill: "#ff005c" }} />
      <small>
        <span style={{ color: "#ff005c", marginLeft: "5px" }}>{text}</span>
      </small>
    </div>
  ) : null;
}

export default memo(ErrorText);

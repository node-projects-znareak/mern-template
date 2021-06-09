import React from "react";

function Btn({ className="", text = undefined, children = undefined, ...props }) {
  return (
    <button {...props} className={"button" + className}>
      {text || children}
    </button>
  );
}

export default React.memo(Btn);

import { memo, useState } from "react";
import ModalUpload from "../Modals/ModalUpload";
import Btn from "./Btn";
import useCurrentUser from "../Hooks/useCurrentUser";
import { BiUpload, BiUserCircle, BiExit } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { removeToken } from "../../Helpers/token";
import { clearCache } from "../../Helpers/cache";

function Navbar({ setImagesArray }) {
  const { push } = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useCurrentUser();

  const toggleOpen = () => setIsOpen((c) => !c);
  const logout = () => {
    setUser({});
    removeToken();
    clearCache();
    push("/");
  };

  return (
    <>
      <nav className="nav">
        {user?.isAdmin && (
          <Btn
            onClick={toggleOpen}
            style={{ width: "auto", background: "#0db373" }}
          >
            Subir imagen
            <BiUpload style={{ marginLeft: "5px", fontSize: "1rem" }} />
          </Btn>
        )}
        <Link to="/perfil">
          <Btn style={{ width: "auto" }}>
            Ver mi cuenta
            <BiUserCircle style={{ marginLeft: "5px", fontSize: "1rem" }} />
          </Btn>
        </Link>

        <Btn
          style={{ width: "auto", marginLeft: "auto", background: "#e23450" }}
          onClick={logout}
        >
          Salir de la cuenta
          <BiExit style={{ marginLeft: "5px", fontSize: "1rem" }} />
        </Btn>
      </nav>
      <ModalUpload {...{ isOpen, toggleOpen, setImagesArray }} />
    </>
  );
}

export default memo(Navbar);

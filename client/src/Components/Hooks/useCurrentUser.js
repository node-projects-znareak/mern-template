import { useContext } from "react";
import UserContext from "../Context/UserContext";

export default function useCurrentUser() {
  const contextData = useContext(UserContext);
  return contextData;
}

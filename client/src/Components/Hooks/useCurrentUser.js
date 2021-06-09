import { useContext } from "react";
import { UserContext } from "../Context/UserProvider";

export default function useCurrentUser() {
  const contextData = useContext(UserContext);
  return contextData;
}

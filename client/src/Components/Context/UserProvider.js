import { createContext } from "react";
import useUserInfo from "../Hooks/useUserInfo";

export const UserContext = createContext();

export default function UserProvider(props) {
  const value = useUserInfo();
  return <UserContext.Provider value={value} {...props} />;
}

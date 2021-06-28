import useUserInfo from "../Hooks/useUserInfo";
import UserContext from "./UserContext";

export default function UserProvider(props) {
  const value = useUserInfo();
  return <UserContext.Provider value={value} {...props} />;
}

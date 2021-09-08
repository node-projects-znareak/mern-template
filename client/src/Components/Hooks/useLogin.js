import { setLogin } from "../../Helpers/api";
import { useMutation } from "react-query";
import { setToken } from "../../Helpers/token";
import useCurrentUser from "./useCurrentUser";

export default function useAuth() {
  const { setUser } = useCurrentUser();
  const obj = useMutation((auth) => setLogin(auth));
  const setSession = (token, user) => {
    setToken(token);
    setUser(user);
  };

  return {
    ...obj,
    setSession,
  };
}

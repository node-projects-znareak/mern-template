import { useEffect } from "react";
import { useQuery } from "react-query";
import { getUserInfo } from "../../Helpers/api";
import { isValidToken } from "../../Helpers/token";
import useCurrentUser from "./useCurrentUser";

export default function useUserInfo() {
  const { user, setUser, logout } = useCurrentUser();
  const { data, isError, ...args } = useQuery("user", getUserInfo, {
    enabled: isValidToken() && !user,
  });

  useEffect(() => {
    // It check if there isn't errors, if the token exists, if the user data isn't
    // an empty object and not to override the current user object data
    if (isValidToken()) {
      if (!isError && data && !user) {
        /*The user's context is important firstly update it remotecatly 
          and after to update locatly it in the context */
        setUser(data);
      } else if (isError) {
        logout();
      }
    }
  }, [data, isError, setUser, logout, user]);

  return { user: data || user, isError, ...args };
}

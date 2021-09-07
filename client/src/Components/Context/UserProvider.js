import { useState, useCallback } from "react";
import { removeToken } from "../../Helpers/token";
import Cookies from "universal-cookie";

import UserContext from "./UserContext";
import { useQueryClient } from "react-query";
import { logoutUser } from "../../Helpers/api";

export default function UserProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUserInfo] = useState(null);
  const setUser = useCallback(
    (data) => setUserInfo((u) => ({ ...u, ...data })),
    []
  );

  const logout = useCallback(async () => {
    const cookies = new Cookies();
    removeToken();
    setUserInfo(null);
    await logoutUser();
    cookies.remove("token");
    queryClient.invalidateQueries("user");
    queryClient.removeQueries();
  }, [queryClient]);

  const value = {
    user,
    setUser,
    logout,
  };

  return <UserContext.Provider value={value} children={children} />;
}

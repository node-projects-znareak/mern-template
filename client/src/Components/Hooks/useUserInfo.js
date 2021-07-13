import { useState, useMemo, useEffect, useCallback } from "react";
import { getUserInfo } from "../../Helpers/api";
import { existsToken, removeToken } from "../../Helpers/token";
import { useQuery } from "react-query";

const default_state = null;

export default function useUserInfo() {
  const { data, isError, isLoading } = useQuery("userInfo", getUserInfo, {
    enabled: existsToken(),
  });
  const [user, setUser] = useState(default_state);

  const logout = useCallback(() => {
    setUser(default_state);
    removeToken();
  }, []);

  const value = useMemo(() => {
    return { user, logout, isLoading, setUser };
  }, [user, logout, isLoading, setUser]);

  useEffect(() => {
    if (!isError && data && Object.keys(data).length > 0) {
      setUser((userState) => ({ ...data, ...userState }));
    } else {
      removeToken();
    }
  }, [data, isError]);

  return value;
}

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

  const value = useMemo(
    () => ({ user, logout, isLoading, setUser }),
    [user, logout, isLoading, setUser]
  );

  useEffect(() => {
    if (data && !isError) {
      setUser((userState) => ({ ...data, ...userState }));
    }
  }, [data, isError]);

  return value;
}

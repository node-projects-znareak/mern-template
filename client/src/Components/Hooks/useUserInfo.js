import { useState, useMemo, useEffect, useCallback } from "react";
import { getUserInfo } from "../../Helpers/api";
import { existsToken, removeToken } from "../../Helpers/token";
import { useQuery } from "react-query";

const default_state = { useError: false };

export default function useUserInfo() {
  const { data, isError, error } = useQuery("userInfo", getUserInfo, {
    enabled: existsToken(),
  });
  const [user, setUser] = useState(default_state);
  const logout = useCallback(() => {
    setUser(default_state);
    removeToken();
    window.location.href = "/";
  }, []);

  const value = useMemo(
    () => ({ user, logout, setUser }),
    [user, logout, setUser]
  );

  useEffect(() => {
    if (data && !isError) {
      setUser((u) => ({ ...data, ...u }));
    }
    if (isError) {
      console.log(error);
      setUser({ userError: true });
    }
  }, [data, isError, error]);

  return value;
}

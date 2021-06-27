import { existsToken, removeToken } from "../../Helpers/token";
import { verifyToken } from "../../Helpers/api";
import { useQuery } from "react-query";
import { useEffect } from "react";

export default function useVerifyToken() {
  const { isLoading, data, isError } = useQuery("token", verifyToken, {
    enabled: existsToken(),
  });
  const isValidToken = isError ? false : data;
  console.log(isValidToken);
  useEffect(() => {
    if (!isLoading && !isValidToken) removeToken();
  }, [isValidToken, isLoading]);

  return { isValidToken, isLoading };
}

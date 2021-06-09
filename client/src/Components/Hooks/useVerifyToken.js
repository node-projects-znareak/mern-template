import { useState, useEffect } from "react";
import { removeToken, getToken } from "../../Helpers/token";
import { verifyToken } from "../../Helpers/api";
import cache from "../../Helpers/cache";

export default function useVerifyToken() {
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const isValid = await verifyToken();
        setIsValidToken(isValid);
        setIsLoading(false);
        if (isValid) {
          cache.set(getToken(), true);
        } else {
          removeToken();
        }
      } catch {
        removeToken();
      }
    }

    if (!getToken()) {
      setIsValidToken(false);
      setIsLoading(false);
    } else if (cache.get(getToken())) {
      console.log("%cToken correcto tomado del cache", "font-size:20px");
      setIsValidToken(true);
      setIsLoading(false);
    } else {
      verify();
    }
  }, []);    

  return { isValidToken, isLoading };
}

import { createContext, useState, useMemo, useEffect } from "react";
import { getUserInfo } from "../../Helpers/api";

export const UserContext = createContext();

export default function UserProvider(props) {
  const [user, setUser] = useState({ userError: false });
  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  useEffect(() => {
    async function userInfo() {
      try {
        const user = await getUserInfo();
        if (user) setUser((u) => ({ ...user, ...u }));
      } catch (error) {
        setUser({ userError: true });
        console.warn("%cError in downloading the user info:");
        console.log(error);
      }
    }

    userInfo();
  }, []);

  return <UserContext.Provider value={value} {...props} />;
}

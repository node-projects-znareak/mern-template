import { Route, Redirect } from "react-router-dom";
import { existsToken } from "../Helpers/token";
import LoaderPage from "./Loaders/loader";
import useUserInfo from "./Hooks/useUserInfo";

export default function RedirectRoute({ component: Component, ...rest }) {
  const { user, isLoading } = useUserInfo();

  if (isLoading) return <LoaderPage />;

  return (
    <Route
      {...rest}
      render={(props) =>
        existsToken() && user ? (
          <Redirect to="/home" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
}

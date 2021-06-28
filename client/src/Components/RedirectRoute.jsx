import { Route, Redirect } from "react-router-dom";
import { existsToken } from "../Helpers/token";
import Loader from "../Components/Loaders/loader";
import useCurrentUser from "./Hooks/useCurrentUser";

export default function RedirectRoute({ component: Component, ...rest }) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return <Loader />;

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

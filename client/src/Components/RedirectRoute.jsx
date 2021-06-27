import { Route, Redirect } from "react-router-dom";
import { existsToken } from "../Helpers/token";
import Loader from "../Components/Loaders/loader";
import useVerifyToken from "./Hooks/useVerifyToken";

export default function RedirectRoute({ component: Component, ...rest }) {
  const { isValidToken, isLoading } = useVerifyToken();
  if (isLoading) return <Loader />;
  
  return (
    <Route
      {...rest}
      render={(props) =>
        existsToken() && isValidToken ? (
          <Redirect to="/home" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
}

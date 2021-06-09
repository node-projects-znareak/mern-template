import { Route, Redirect } from "react-router-dom";
import { existsToken } from "../Helpers/token";
import Loader from "../Components/Loaders/loader";
import useVerifyToken from "./Hooks/useVerifyToken";
import useCurrentUser from "./Hooks/useCurrentUser";
import SessionError from "../Components/Pages/SessionError/SessionError";

export default function PrivateRoute({ component: Component, ...rest }) {
  const { isValidToken, isLoading } = useVerifyToken();
  const { user } = useCurrentUser();

  if (isLoading) return <Loader />;
  if (user.userError) return <SessionError />;

  return (
    <Route {...rest}>
      {(props) =>
        existsToken() && isValidToken ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    </Route>
  ); 
}

import { Route, Redirect } from "react-router-dom";
import { existsToken } from "../Helpers/token";
import Loader from "../Components/Loaders/loader";
import useCurrentUser from "./Hooks/useCurrentUser";

export default function PrivateRoute({ component: Component, ...rest }) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return <Loader />;
  return (
    <Route {...rest}>
      {(props) =>
        existsToken() && user ? <Component {...props} /> : <Redirect to="/" />
      }
    </Route>
  );
}

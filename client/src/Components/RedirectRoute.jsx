import { Route, Redirect } from "react-router-dom";
import { existsToken } from "../Helpers/token";

export default function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        existsToken() ? <Redirect to="/home" /> : <Component {...props} />
      }
    />
  );
}

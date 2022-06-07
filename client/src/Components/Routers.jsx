import { Routes, BrowserRouter, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RedirectRoute from "./RedirectRoute";
import routers from "../config/routers";

export default function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        {routers.map(({ path, element: Element, ...props }, i) => {
          const key = path || i;

          if (props.private) {
            return (
              <Route path={path} element={<PrivateRoute />} key={key}>
                <Route element={<Element />} index {...props} />
              </Route>
            );
          }
          if (props.redirect) {
            return (
              <Route path={path} element={<RedirectRoute />} key={key}>
                <Route element={<Element />} index {...props} />
              </Route>
            );
          }
          return (
            <Route element={<Element />} path={path} key={key} {...props} />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
}

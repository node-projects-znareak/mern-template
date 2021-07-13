import Async from "../Components/LazyComponent";

export const route = (component, path = "*", ...rest) => {
  return {
    component: Async(component),
    path,
    ...rest,
  };
};

export const privateRoute = (component, path = "/") => {
  return { component: Async(component), path, exact: true, private: true };
};

export const redirectRoute = (component, path = "/") => {
  return {
    component: Async(component),
    path,
    exact: true,
    redirect: true,
  };
};

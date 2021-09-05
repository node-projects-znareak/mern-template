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

/**
 * It get the error that backend sends to client
 * @param {Response} mutationRequest The request response made by `useMutation`, `useQuery` or `axios.method`
 * @returns The error text
 */
export function getErrorValidation(
  mutationRequest,
  defaultError = "Ocurrió un error, verifica tus datos."
) {
  const objError = mutationRequest?.error?.response?.data;
  if (typeof objError?.data === "string") return objError?.data;

  return (
    objError?.data?.[0] ||
    objError?.message ||
    mutationRequest?.data?.message ||
    mutationRequest?.error?.toString() ||
    defaultError
  );
}

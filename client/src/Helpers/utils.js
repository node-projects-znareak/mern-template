import Async from "../Components/LazyComponent";

export const route = (component, path = "*", rest) => {
  return {
    element: Async(component),
    path,
    ...rest,
  };
};

export const privateRoute = (component, path = "/", props) => {
  return route(component, path, { private: true, ...props });
};

export const redirectRoute = (component, path = "/", props) => {
  return route(component, path, { redirect: true, ...props });
};

export const publicRoute = (component, path = "/", props) => {
  return route(component, path, { public: true, ...props });
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

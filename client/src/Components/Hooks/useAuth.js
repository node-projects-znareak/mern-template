import { setLogin } from "../../Helpers/api";
import { useMutation } from "react-query";

export default function useAuth() {
  const obj = useMutation((auth) => setLogin(auth));
  return obj;
}

import Cookies from "universal-cookie";

const cookies = new Cookies();

export function getToken() {
  return cookies.get("token");
}

export function existsToken() {
  return getToken() !== undefined;
}

export function removeToken() {
  cookies.remove("token");
}

import jwtDecode from "jwt-decode";

export function getToken() {
  return localStorage.getItem("token");
}

export function existsToken() {
  return getToken() !== null;
}

export function isValidToken() {
  if (!existsToken()) return false;
  const token = getToken();
  const decoded = jwtDecode(token);

  if (Date.now() >= decoded.exp * 1000) {
    console.log("TOKEN EXPIRADO!");
    removeToken();
    return false;
  }
  
  return true;
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

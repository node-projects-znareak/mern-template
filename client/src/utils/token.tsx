export function removeToken() {
  localStorage.removeItem("token");
}

export function setToken(token : string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  const token = localStorage.getItem("token");
  return token;
}

export function existsToken() {
  const token = getToken();
  return token !== null && token !== undefined && token !== "";
}

import { api, login, signup, userInfo } from "../config/config";
import { getToken, removeToken, isValidToken } from "./token";
import axios from "axios";

const instance = axios.create({
  baseURL: api,
});

instance.interceptors.request.use((req) => {
  if (isValidToken()) {
    req.headers.authorization = "Bearer " + getToken();
  }
  return req;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ERR_NETWORK") return Promise.reject(err.message);

    if (
      err.response.data.statusCode === 401 &&
      err.response.config.url !== userInfo // The private router check this
    ) {
      isValidToken() && removeToken();
      window.location.href = "/";
    }
    return Promise.reject(err.message);
  }
);

export async function setLogin(auth) {
  const data = await instance.post(login, auth);
  return data?.data;
}

export async function signupUser(payload) {
  const data = await instance.post(signup, payload);
  return data?.data;
}

export async function getUserInfo() {
  const res = await instance.get(userInfo);
  return res?.data?.data;
}

export async function testApi() {
  const res = await instance.get("/test");
  return res?.data?.data;
}

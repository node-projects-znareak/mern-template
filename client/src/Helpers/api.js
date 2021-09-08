import { api, login, signup, userInfo } from "../config/config";
import { getToken, removeToken, existsToken } from "./token";
import axios from "axios";

const instance = axios.create({
  baseURL: api,
});

instance.interceptors.request.use((req) => {
  if (existsToken()) {
    req.headers.authorization = "Bearer " + getToken();
  }
  return req;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response.data.statusCode === 401 &&
      err.response.config.url !== userInfo
    ) {
      existsToken() && removeToken();
      window.location.href = "/";
    }
    return Promise.reject(err);
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

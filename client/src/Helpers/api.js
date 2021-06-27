import { api, login, signup, token, userInfo } from "../config/config";
import { getToken } from "./token";
import axios from "axios";

const instance = axios.create({
  baseURL: api,
});

const config = () => ({
  headers: {
    Authorization: "Bearer " + getToken(),
  },
});

export async function setLogin(auth) {
  const data = await instance.post(login, auth);
  return data?.data;
}

export async function signupUser(payload) {
  const data = await instance.post(signup, payload);
  return data?.data;
}

export async function verifyToken() {
  const data = await instance.get(token, config());
  return Boolean(data?.data?.ok);
}

export async function getUserInfo() {
  if (!getToken()) return null;
  const res = await instance.get(userInfo, config());
  return res?.data?.data;
}

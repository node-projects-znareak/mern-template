import { api, login, logout, signup, userInfo } from "../config/config";
import { getToken } from "./token";
import axios from "axios";
axios.defaults.withCredentials = true;

const instance = axios.create({
  baseURL: api,
  crossDomain: true,
  withCredentials: true,
});

export async function setLogin(auth) {
  const data = await instance.post(login, auth);
  return data?.data;
}

export async function signupUser(payload) {
  const data = await instance.post(signup, payload);
  return data?.data;
}

export async function getUserInfo() {
  if (!getToken()) return null;
  const res = await instance.get(userInfo);
  return res?.data?.data;
}

export async function logoutUser() {
  const res = await instance.get(logout);
  return res?.data?.data;
}

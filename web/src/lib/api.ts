import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "pb_access_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { data } = axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = data.data.accessToken;
        Cookies.set(TOKEN_KEY, newToken);
        original.headers.authorization = `Bearer ${newToken}`;

        return api(original);
      } catch {
        Cookies.remove(TOKEN_KEY);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export const tokenUtils = {
  set: (token: string) =>
    Cookies.set(TOKEN_KEY, token, {
      expires: 1,
      path: "/",
      sameSite: "strict",
    }),
  get: () => Cookies.get(TOKEN_KEY),
  remove: () => Cookies.remove(TOKEN_KEY, { path: "/" }),
};

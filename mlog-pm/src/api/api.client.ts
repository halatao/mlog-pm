import https from "https";
import { Api } from "./api.gen";

const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_GATEWAY_API_URL?.includes("localhost");

export const userApi = new Api({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  ...(isDev && { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }),
});

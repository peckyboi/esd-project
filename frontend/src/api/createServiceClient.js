import axios from "axios";

function getErrorMessage(error, fallbackMessage) {
  const status = error?.response?.status;
  const detail =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage;

  return status ? `[${status}] ${detail}` : detail;
}

//creates a reusable service that just requires the url, uses interceptors
export function createServiceClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  //intercepts request
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(new Error(getErrorMessage(error, "Request setup failed"))),
  );


  //intercepts response
  client.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(new Error(getErrorMessage(error, "Request failed"))),
  );

  return client;
}

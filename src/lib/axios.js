import axios from 'axios';
import config from '@/config';

let getAccessToken = () => null;

const httpClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function setAccessTokenProvider(provider) {
  if (typeof provider === 'function') {
    getAccessToken = provider;
  }
}

httpClient.interceptors.request.use(
  (request) => {
    const token = getAccessToken();
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default httpClient;

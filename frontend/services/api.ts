import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000" });

api.interceptors.request.use((config) => {
  const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(r => r, async (err) => {
  if (err.response?.status === 401) {
    const rt = localStorage.getItem("refreshToken");
    const res = await axios.post("http://localhost:5000/auth/refresh", { refreshToken: rt });
    localStorage.setItem("accessToken", res.data.accessToken);
    err.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
    return axios(err.config);
  }
  return Promise.reject(err);
});

export default api;

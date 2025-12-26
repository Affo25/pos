import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["Content-Type"] = "application/json";

        return config;
    },
    (error) => Promise.reject(error)
);

http.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default http;


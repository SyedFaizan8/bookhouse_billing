import axios from "axios";

const api = axios.create({
    baseURL: '/backend',
    withCredentials: true,
});

export default api;

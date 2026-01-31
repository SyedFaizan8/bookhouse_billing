import axios from "axios";
import { API_BASE_URL, isProduction } from "../constants";

const api = axios.create({
    baseURL: isProduction ? "/api" : API_BASE_URL + '/api',
    withCredentials: true,
});

export default api;

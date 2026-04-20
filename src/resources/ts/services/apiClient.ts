import axios from 'axios';
import type { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/",
    timeout: 10000,  // 10 secondi
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;

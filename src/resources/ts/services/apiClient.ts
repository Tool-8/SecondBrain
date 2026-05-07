import axios from 'axios';
import type { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/",
    timeout: 10000,  // 10 secondi
    validateStatus: (status) => {
        return status >= 200 && status <= 399;
    },
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    response => response,

    // Converte il blob in json se il backend ritorna un errore
    async error => {
        if (error.response?.data instanceof Blob) {
            const text = await error.response.data.text();
            try {
                error.response.data = JSON.parse(text);
            } catch {
                error.response.data = { message: text };
            }
        }
        return Promise.reject(error);
    }
)

export default apiClient;

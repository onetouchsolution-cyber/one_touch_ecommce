import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include the auth token in headers
API.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 global errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('JWT Token expired or invalid. Logging out.');
            localStorage.removeItem('userInfo');
            window.location.href = '/login'; // Redirect to login page
        }
        return Promise.reject(error);
    }
);

export default API;

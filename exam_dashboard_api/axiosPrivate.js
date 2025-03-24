const axios = require('axios');
require('dotenv').config();
const refreshToken = require('./refreshToken');
const { DASHBOARD_CONFIG } = require("./dashboardConstants");

const axiosPrivate = axios.create({
    baseURL: process.env.EXAM_DASHBOARD_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true // used for sending cookie
});

let isRefreshing = false;
let refreshPromise = null;

// Axios interceptors
axiosPrivate.interceptors.request.use(
    async (config) => {
        if(!config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${DASHBOARD_CONFIG.EXAM_DASHBOARD_ACCESS_TOKEN}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
    response => response,
    async (error) => {
        const prevRequest = error?.config;

        if(error?.response?.status === 403 && !prevRequest?.sent) {
            prevRequest.sent = true;

            if(!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshToken(); // Call refreshToken function
            }

            try {
                const newAccessToken = await refreshPromise;
                DASHBOARD_CONFIG.EXAM_DASHBOARD_ACCESS_TOKEN = newAccessToken; // Update token globally
                prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosPrivate(prevRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

module.exports = axiosPrivate;
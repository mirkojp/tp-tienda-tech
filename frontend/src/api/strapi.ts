import axios from 'axios';
import { STRAPI_URL } from './config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const strapiApi = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

strapiApi.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('@auth_jwt');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('[strapiApi] Error al obtener el token JWT de AsyncStorage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
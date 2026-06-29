// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { STRAPI_URL } from '../api/config';

const API_URL = `${STRAPI_URL}/api`;

interface AuthContextType {
    user: any | null;
    jwt: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>; // <-- AGREGAR ESTA LÍNEA
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [jwt, setJwt] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Cargar la sesión guardada al iniciar la app
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('@auth_user');
                const storedJwt = await AsyncStorage.getItem('@auth_jwt');

                if (storedUser && storedJwt) {
                    setUser(JSON.parse(storedUser));
                    setJwt(storedJwt);
                    // Configuramos Axios para que mande el token por defecto en futuras peticiones si hiciera falta
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedJwt}`;
                }
            } catch (e) {
                console.error('Error cargando datos de autenticación local:', e);
            } finally {
                setLoading(false);
            }
        };

        loadStorageData();
    }, []);

    // Función para Iniciar Sesión pegándole al plugin nativo de Strapi
    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/local`, {
                identifier: email, // Strapi acepta tanto username como email en este campo
                password: password,
            });

            const { jwt: token, user: userData } = response.data;

            // Guardar en estados
            setJwt(token);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Persistir en el almacenamiento del celular
            await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));
            await AsyncStorage.setItem('@auth_jwt', token);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error?.message || 'Credenciales inválidas';
            throw new Error(errorMsg);
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/local/register`, {
                username,
                email,
                password,
            });

            const { jwt: token, user: userData } = response.data;

            setJwt(token);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));
            await AsyncStorage.setItem('@auth_jwt', token);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error?.message || 'Error al registrar el usuario';
            throw new Error(errorMsg);
        }
    };

    // Función para Cerrar Sesión
    const logout = async () => {
        setUser(null);
        setJwt(null);
        delete axios.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('@auth_user');
        await AsyncStorage.removeItem('@auth_jwt');
    };

    return (
        <AuthContext.Provider value={{ user, jwt, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
}
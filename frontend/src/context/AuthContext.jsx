import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hydrateUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!storedToken) {
                setLoading(false);
                return;
            }

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            try {
                const response = await authService.me();
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        hydrateUser();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const updateUser = (userData, token = localStorage.getItem('token')) => {
        if (token) {
            localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout, authenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

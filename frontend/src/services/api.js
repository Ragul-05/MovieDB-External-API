import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/',
});

export const normalizeMovie = (movie) => {
    if (!movie) return movie;

    return {
        ...movie,
        imdbID: movie.imdbID ?? movie.imdbId ?? '',
        imdbId: movie.imdbId ?? movie.imdbID ?? '',
        Title: movie.Title ?? movie.title ?? '',
        title: movie.title ?? movie.Title ?? '',
        Year: movie.Year ?? movie.year ?? '',
        year: movie.year ?? movie.Year ?? '',
        Poster: movie.Poster ?? movie.poster ?? 'N/A',
        poster: movie.poster ?? movie.Poster ?? 'N/A',
        Genre: movie.Genre ?? movie.genre ?? 'N/A',
        genre: movie.genre ?? movie.Genre ?? 'N/A',
        Plot: movie.Plot ?? movie.plot ?? 'N/A',
        plot: movie.plot ?? movie.Plot ?? 'N/A',
        Director: movie.Director ?? movie.director ?? 'N/A',
        director: movie.director ?? movie.Director ?? 'N/A',
        Runtime: movie.Runtime ?? movie.runtime ?? 'N/A',
        runtime: movie.runtime ?? movie.Runtime ?? 'N/A',
        Rated: movie.Rated ?? movie.rated ?? 'N/A',
        rated: movie.rated ?? movie.Rated ?? 'N/A',
        Country: movie.Country ?? movie.country ?? 'N/A',
        country: movie.country ?? movie.Country ?? 'N/A',
        Language: movie.Language ?? movie.language ?? 'N/A',
        language: movie.language ?? movie.Language ?? 'N/A',
        Writer: movie.Writer ?? movie.writer ?? 'N/A',
        writer: movie.writer ?? movie.Writer ?? 'N/A',
        Actors: movie.Actors ?? movie.actors ?? 'N/A',
        actors: movie.actors ?? movie.Actors ?? 'N/A',
        Awards: movie.Awards ?? movie.awards ?? 'N/A',
        awards: movie.awards ?? movie.Awards ?? 'N/A',
        Production: movie.Production ?? movie.production ?? 'N/A',
        production: movie.production ?? movie.Production ?? 'N/A',
        Type: movie.Type ?? movie.type ?? 'movie',
        type: movie.type ?? movie.Type ?? 'movie',
    };
};

// Add a request interceptor to attach the JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (credentials) => API.post('/api/auth/login', credentials),
    register: (userData) => API.post('/api/auth/register', userData),
    me: () => API.get('/api/auth/me'),
    updateProfile: (userData) => API.put('/api/auth/profile', userData),
};

export const movieService = {
    search: (name) => API.get('/movies', { params: { name } }),
    getDetails: (id) => API.get(`/movies/${id}`),
};

export const favoriteService = {
    list: () => API.get('/api/favorites'),
    add: (imdbId) => API.post(`/api/favorites?imdbId=${imdbId}`),
    remove: (id) => API.delete(`/api/favorites/${id}`),
};

export const historyService = {
    get: () => API.get('/api/history'),
    remove: (id) => API.delete(`/api/history/${id}`),
    clear: () => API.delete('/api/history'),
};

export const aiService = {
    getSummary: (imdbId) => API.post(`/api/ai/summary?imdbId=${imdbId}`),
    getRecommendations: () => API.get('/api/ai/recommendations'),
    chat: (prompt) => API.post('/api/ai/chat', { prompt }),
};

export default API;

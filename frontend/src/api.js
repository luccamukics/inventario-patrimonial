const API_URL = 'http://localhost:3000/api';

export function getToken() {
    return localStorage.getItem('inventario_token');
}

export function setToken(token) {
    localStorage.setItem('inventario_token', token);
}

export function clearToken() {
    localStorage.removeItem('inventario_token');
    localStorage.removeItem('inventario_usuario');
}

export async function api(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get('content-type') || '';

    let data = null;

    if (contentType.includes('application/json')) {
        data = await response.json();
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || 'Erro na requisição');
    }

    return data;
}

export { API_URL };

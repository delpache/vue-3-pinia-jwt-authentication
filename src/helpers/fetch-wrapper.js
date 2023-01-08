import { useAuthStore } from "@/stores";

export const fetchWrapper = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE')
}

function request(method) {
    return (url, body) => {
        const requestOptions = {
            method,
            headers: authHeader(url)
        }

        if (body) {
            requestOptions.headers['Content-Type'] = 'application/json'
            requestOptions.body = JSON.stringify(body)
        }

        return fetch(url, requestOptions)
            .then(handleResponse)
    }
}

function authHeader(url) {
    const { user } = useAuthStore()
    const isLoggedIn = !!user?.token
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL)

    if (isLoggedIn && isApiUrl) {
        return {
            Authorization: `Bearer ${user.token}`
        }
    }
    else {
        return {}
    }
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text)

        if (!response.ok) {
            const { user, logout } = useAuthStore()

            if ([401, 403].includes(response.status) && user) {
                // Déconnexion automatique si une réponse 401 non autorisée
                // ou 403 interdite est renvoyée par l'API.
                logout()
            }

            const error = (data && data.message) || response.statusText
            return Promise.reject(error)
        }

        return data
    })
}
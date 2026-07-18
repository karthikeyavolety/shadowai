import axios from 'axios'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shadowai_access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false
let pendingQueue: Array<() => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push(() => resolve(api(originalRequest)))
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('shadowai_refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const res = await api.post('/auth/refresh', {
          refresh_token: refreshToken,
        })

        const newAccess = res.data.data.access_token

        localStorage.setItem('shadowai_access_token', newAccess)

        pendingQueue.forEach((cb) => cb())
        pendingQueue = []

        return api(originalRequest)
      } catch (err) {
        localStorage.removeItem('shadowai_access_token')
        localStorage.removeItem('shadowai_refresh_token')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Attach JWT token from localStorage for admin requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path.startsWith('/admin') && path !== '/admin/login') {
        localStorage.removeItem('admin_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// ---- Public API calls ----
export const fetchSettings = () => api.get('/api/settings/flat').then((r) => r.data)
export const fetchPageContent = (page: string) => api.get(`/api/content/${page}`).then((r) => r.data)
export const fetchMedia = (params?: Record<string, string>) =>
  api.get('/api/media', { params }).then((r) => r.data)
export const fetchTeam = () => api.get('/api/team').then((r) => r.data)
export const fetchInstitutions = () => api.get('/api/institutions').then((r) => r.data)
export const fetchNews = (params?: Record<string, string>) =>
  api.get('/api/news', { params }).then((r) => r.data)
export const fetchNewsBySlug = (slug: string) =>
  api.get(`/api/news/${slug}`).then((r) => r.data)
export const fetchNewsletters = (params?: Record<string, string>) =>
  api.get('/api/newsletters', { params }).then((r) => r.data)
export const fetchPartners = () => api.get('/api/partners').then((r) => r.data)

// ---- Contact Messages ----
export const submitContactMessage = (data: { name: string; email: string; subject: string; message: string }) =>
  api.post('/api/messages', data).then((r) => r.data)

export const fetchMessages = () => api.get('/api/messages').then((r) => r.data)
export const fetchUnreadCount = () => api.get('/api/messages/unread-count').then((r) => r.data)
export const toggleMessageRead = (id: number) => api.patch(`/api/messages/${id}/read`).then((r) => r.data)
export const deleteMessage = (id: number) => api.delete(`/api/messages/${id}`).then((r) => r.data)

// ---- Admin API calls ----
export const adminLogin = (username: string, password: string) =>
  api.post('/api/auth/login', { username, password }).then((r) => r.data)

export const adminUpdateSetting = (key: string, value: string) =>
  api.put('/api/settings', { key, value }).then((r) => r.data)

export const adminBulkUpdateSettings = (settings: Record<string, string>) =>
  api.put('/api/settings/bulk', { settings }).then((r) => r.data)

export const adminUpdateContent = (page: string, section: string, field: string, content: string) =>
  api.put('/api/content', { page, section, field, content }).then((r) => r.data)

export const adminBulkUpdateContent = (updates: Array<{ page: string; section: string; field: string; content: string }>) =>
  api.put('/api/content/bulk', { updates }).then((r) => r.data)

export const adminUploadMedia = (formData: FormData) =>
  api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const adminDeleteMedia = (id: number) =>
  api.delete(`/api/media/${id}`).then((r) => r.data)

export const adminCreateNewsletter = (formData: FormData) =>
  api.post('/api/newsletters', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
export const adminUpdateNewsletter = (id: number, formData: FormData) =>
  api.put(`/api/newsletters/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
export const adminDeleteNewsletter = (id: number) =>
  api.delete(`/api/newsletters/${id}`).then((r) => r.data)

export const adminUpdateMedia = (id: number, data: Record<string, unknown>) =>
  api.put(`/api/media/${id}`, data).then((r) => r.data)

// ---- Children Sponsorship ----
export const fetchChildren = (params?: Record<string, string>) =>
  api.get('/api/children', { params }).then((r) => r.data)

// ---- Events ----
export const fetchEvents = (params?: Record<string, string>) =>
  api.get('/api/events', { params }).then((r) => r.data)

// ---- Needs ----
export const fetchNeeds = (params?: Record<string, string>) =>
  api.get('/api/needs', { params }).then((r) => r.data)

// ---- Donate Impact Items ----
export const fetchImpactItems = () => api.get('/api/impact-items').then((r) => r.data)
export const fetchAllImpactItems = () => api.get('/api/impact-items/all').then((r) => r.data)

// ---- Testimonials ----
export const fetchTestimonials = () => api.get('/api/testimonials').then((r) => r.data)
export const fetchAllTestimonials = () => api.get('/api/testimonials/all').then((r) => r.data)

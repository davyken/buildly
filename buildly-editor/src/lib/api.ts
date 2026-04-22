import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Sites ─────────────────────────────────────────────────────────────────────
export const sitesApi = {
  list: () => api.get('/sites'),
  get: (id: string) => api.get(`/sites/${id}`),
  create: (name: string, templateId?: string) =>
    api.post('/sites', { name, templateId }),
  update: (id: string, data: any) => api.patch(`/sites/${id}`, data),
  remove: (id: string) => api.delete(`/sites/${id}`),
  duplicate: (id: string) => api.post(`/sites/${id}/duplicate`),
  addPage: (id: string, name: string, path: string) =>
    api.post(`/sites/${id}/pages`, { name, path }),
  removePage: (id: string, pageId: string) =>
    api.delete(`/sites/${id}/pages/${pageId}`),
};

// ── Versions ──────────────────────────────────────────────────────────────────
export const versionsApi = {
  list: (siteId: string) => api.get(`/sites/${siteId}/versions`),
  save: (siteId: string, label: string) =>
    api.post(`/sites/${siteId}/versions/save`, { label }),
  restore: (siteId: string, versionId: string) =>
    api.post(`/sites/${siteId}/versions/${versionId}/restore`),
};

// ── Publish ───────────────────────────────────────────────────────────────────
export const publishApi = {
  publish: (id: string) => api.post(`/sites/${id}/publish`),
  unpublish: (id: string) => api.post(`/sites/${id}/unpublish`),
  info: (id: string) => api.get(`/sites/${id}/publish-info`),
  jobStatus: (jobId: string) => api.get(`/publish/jobs/${jobId}`),
};

// ── Assets ────────────────────────────────────────────────────────────────────
export const assetsApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/assets/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/assets'),
  remove: (publicId: string) => api.delete(`/assets/${publicId}`),
};

// ── Templates ─────────────────────────────────────────────────────────────────
export const templatesApi = {
  list: (category?: string) =>
    api.get('/templates', { params: category ? { category } : {} }),
  use: (id: string) => api.post(`/templates/${id}/use`),
};

// ── Domains ───────────────────────────────────────────────────────────────────
export const domainsApi = {
  connect: (siteId: string, domain: string) =>
    api.post(`/sites/${siteId}/domain`, { domain }),
  status: (siteId: string) => api.get(`/sites/${siteId}/domain`),
  verify: (siteId: string) => api.get(`/sites/${siteId}/domain/verify`),
  disconnect: (siteId: string) => api.delete(`/sites/${siteId}/domain`),
};

// ── Submissions ───────────────────────────────────────────────────────────────
export const submissionsApi = {
  list: (siteId: string, page = 1) =>
    api.get(`/sites/${siteId}/submissions`, { params: { page } }),
  markRead: (id: string) => api.patch(`/submissions/${id}/read`),
  remove: (id: string) => api.delete(`/submissions/${id}`),
};

import { API_URL } from './api-config'
export const API_BASE_URL = API_URL

export const apiEndpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    verify: `${API_BASE_URL}/auth/verify`
  },
  staff: `${API_BASE_URL}/staff`,
  admissions: `${API_BASE_URL}/admissions`,
  queries: `${API_BASE_URL}/queries`,
  analytics: `${API_BASE_URL}/analytics`
}
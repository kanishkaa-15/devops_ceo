import { API_URL } from './api-config'
const API_BASE_URL = API_URL;

class ApiService {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Staff API
  async getStaff() {
    return this.request('/staff');
  }

  async getStaffById(id: string) {
    return this.request(`/staff/${id}`);
  }

  async createStaff(staff: any) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  }

  async updateStaff(id: string, staff: any) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    });
  }

  async deleteStaff(id: string) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Admissions API
  async getAdmissions() {
    return this.request('/admissions');
  }

  async createAdmission(admission: any) {
    return this.request('/admissions', {
      method: 'POST',
      body: JSON.stringify(admission),
    });
  }

  async updateAdmission(id: string, admission: any) {
    return this.request(`/admissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(admission),
    });
  }

  async deleteAdmission(id: string) {
    return this.request(`/admissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Queries API
  async getQueries() {
    return this.request('/queries');
  }

  async createQuery(query: any) {
    return this.request('/queries', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async updateQuery(id: string, query: any) {
    return this.request(`/queries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(query),
    });
  }

  async deleteQuery(id: string) {
    return this.request(`/queries/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics API
  async getStudentPerformance() {
    return this.request('/analytics/student-performance');
  }

  async getAdmissionsAnalytics() {
    return this.request('/analytics/admissions');
  }

  async getRetentionAnalytics() {
    return this.request('/analytics/retention');
  }

  async getHealthIndex() {
    return this.request('/analytics/health-index');
  }

  async getParentTrust() {
    return this.request('/analytics/parent-trust');
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(token: string) {
    return this.request('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Achievements API
  async getAchievements() {
    return this.request('/achievements');
  }

  async createAchievement(achievement: any) {
    return this.request('/achievements', {
      method: 'POST',
      body: JSON.stringify(achievement),
    });
  }

  async updateAchievement(id: string, achievement: any) {
    return this.request(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(achievement),
    });
  }

  async deleteAchievement(id: string) {
    return this.request(`/achievements/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // sends and stores session cookies
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    if (endpoint !== '/auth/me' && endpoint !== '/auth/login') {
      // clear or trigger auth state refresh
    }
    const errData = await response.json().catch(() => ({ message: 'Unauthorized' }));
    throw new Error(errData.message || 'Authentication required');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errData.message || `Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => request('/auth/me'),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // Departments
  getDepartments: () => request('/departments'),

  // Student
  getStudentDashboard: () => request('/student/dashboard'),
  logStudentMood: (mood, notes) =>
    request('/student/log', {
      method: 'POST',
      body: JSON.stringify({ mood, notes }),
    }),

  // Teacher
  getTeacherDashboard: () => request('/teacher/dashboard'),
  getTeacherStudentDetail: (caseId) => request(`/teacher/student/${caseId}`),
  submitTeacherSolution: (caseId, solution) =>
    request(`/teacher/solution/${caseId}`, {
      method: 'POST',
      body: JSON.stringify({ solution }),
    }),
  resolveTeacherCase: (caseId) =>
    request(`/teacher/resolve/${caseId}`, {
      method: 'POST',
    }),

  // HOD
  getHodDashboard: () => request('/hod/dashboard'),
  assignHodCase: (caseId, teacherId) =>
    request(`/hod/assign/${caseId}`, {
      method: 'POST',
      body: JSON.stringify({ teacherId }),
    }),

  // Principal
  getPrincipalDashboard: () => request('/principal/dashboard'),
};

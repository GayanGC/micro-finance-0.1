// API Client Wrapper

let authToken = null;

export const setClientAuthToken = (token) => {
  authToken = token;
};

async function apiRequest(endpoint, options = {}) {
  const url = `/api${endpoint}`;

  // Prepare headers
  const headers = {
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Handle JSON request body
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const fetchOptions = {
    ...options,
    headers,
    body,
  };

  try {
    const res = await fetch(url, fetchOptions);
    let responseData = null;

    try {
      responseData = await res.json();
    } catch (e) {
      // Response is not JSON
    }

    if (!res.ok) {
      const errMsg = (responseData && responseData.message) || `Request failed with status ${res.status}`;
      const err = new Error(errMsg);
      err.statusCode = res.status;
      throw err;
    }

    return responseData;
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (error.statusCode) {
      throw error;
    }
    // Otherwise it's a network error/unreachable server
    console.error('API Request Error:', error);
    throw new Error('Backend server is unreachable. Please check if the API is running.');
  }
}

// Auth API
export const login = (credentials) => {
  // credentials: { loginType: 'phone', phone, pin } or { loginType: 'email', email, password }
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  });
};

// Customers API
export const getCustomers = (query = '') => {
  const endpoint = query ? `/customers?q=${encodeURIComponent(query)}` : '/customers';
  return apiRequest(endpoint);
};

export const getCustomer = (id) => {
  return apiRequest(`/customers/${id}`);
};

export const createCustomer = (data) => {
  return apiRequest('/customers', {
    method: 'POST',
    body: data
  });
};

// Loans API
export const getLoans = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== 'All') {
    params.append('type', filters.type);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/loans${queryString}`);
};

export const getLoan = (id) => {
  return apiRequest(`/loans/${id}`);
};

export const createLoan = (data) => {
  return apiRequest('/loans', {
    method: 'POST',
    body: data
  });
};

// Payments API
export const getTodayPayments = () => {
  return apiRequest('/payments/today');
};

export const recordPayment = (data) => {
  // data: { loanId, amount, note }
  return apiRequest('/payments', {
    method: 'POST',
    body: data
  });
};

// Reports API
export const getReportSummary = () => {
  return apiRequest('/reports/summary');
};

export const getReportTrend = () => {
  return apiRequest('/reports/trend');
};

export const getReportBreakdown = () => {
  return apiRequest('/reports/breakdown');
};

// Notifications API
export const getNotifications = () => {
  return apiRequest('/notifications');
};

// ── Employee API ────────────────────────────────────────────────────────────
export const getEmployees = (status = '') => {
  const q = status ? `?status=${status}` : '';
  return apiRequest(`/employees${q}`);
};
export const registerEmployee = (data) =>
  apiRequest('/employees', { method: 'POST', body: data });
export const getEmployee = (id) =>
  apiRequest(`/employees/${id}`);
export const updateEmployee = (id, data) =>
  apiRequest(`/employees/${id}`, { method: 'PUT', body: data });
export const getMyProfile = () =>
  apiRequest('/employees/my-profile');
export const getEmployeeStats = () =>
  apiRequest('/employees/stats');

// ── Attendance API ──────────────────────────────────────────────────────────
export const markAttendance = (data) =>
  apiRequest('/attendance', { method: 'POST', body: data });
export const getMyAttendance = (month, year) =>
  apiRequest(`/attendance/my?month=${month}&year=${year}`);
export const getAllAttendance = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/attendance/all${params ? '?' + params : ''}`);
};
export const updateAttendance = (id, data) =>
  apiRequest(`/attendance/${id}`, { method: 'PUT', body: data });
export const getAttendanceSummary = (employeeId, month, year) =>
  apiRequest(`/attendance/summary?employeeId=${employeeId}&month=${month}&year=${year}`);

// ── Leave API ───────────────────────────────────────────────────────────────
export const requestLeave = (data) =>
  apiRequest('/leaves', { method: 'POST', body: data });
export const getMyLeaves = () =>
  apiRequest('/leaves/my');
export const getAllLeaves = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/leaves/all${params ? '?' + params : ''}`);
};
export const reviewLeave = (id, data) =>
  apiRequest(`/leaves/${id}/review`, { method: 'PUT', body: data });

// ── Policy API ──────────────────────────────────────────────────────────────
export const getPolicies = (category = '') => {
  const q = category ? `?category=${category}` : '';
  return apiRequest(`/policies${q}`);
};
export const createPolicy = (data) =>
  apiRequest('/policies', { method: 'POST', body: data });
export const updatePolicy = (id, data) =>
  apiRequest(`/policies/${id}`, { method: 'PUT', body: data });
export const deletePolicy = (id) =>
  apiRequest(`/policies/${id}`, { method: 'DELETE' });

// ── Salary API ──────────────────────────────────────────────────────────────
export const getSalaryRecords = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/salaries/records${params ? '?' + params : ''}`);
};
export const createSalaryRecord = (data) =>
  apiRequest('/salaries/records', { method: 'POST', body: data });
export const updateSalaryRecord = (id, data) =>
  apiRequest(`/salaries/records/${id}`, { method: 'PUT', body: data });

export const requestAdvance = (data) =>
  apiRequest('/salaries/advances', { method: 'POST', body: data });
export const getAdvances = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/salaries/advances${params ? '?' + params : ''}`);
};
export const reviewAdvance = (id, data) =>
  apiRequest(`/salaries/advances/${id}/review`, { method: 'PUT', body: data });

export const requestEmployeeLoan = (data) =>
  apiRequest('/salaries/loans', { method: 'POST', body: data });
export const getEmployeeLoans = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/salaries/loans${params ? '?' + params : ''}`);
};
export const reviewEmployeeLoan = (id, data) =>
  apiRequest(`/salaries/loans/${id}/review`, { method: 'PUT', body: data });
export const repayEmployeeLoan = (id, data) =>
  apiRequest(`/salaries/loans/${id}/repay`, { method: 'POST', body: data });

// ── Questions / Support API ──────────────────────────────────────────────────
export const askQuestion = (data) =>
  apiRequest('/questions', { method: 'POST', body: data });
export const getQuestions = () =>
  apiRequest('/questions');
export const answerQuestion = (id, data) =>
  apiRequest(`/questions/${id}/answer`, { method: 'PUT', body: data });

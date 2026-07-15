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

export interface RequestOptions extends RequestInit {
  body?: any;
}

async function request(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('budgetcontrol_session_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const newOptions = { ...options };

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    newOptions.body = JSON.stringify(options.body);
  }

  newOptions.headers = headers;

  const response = await fetch(path, newOptions);

  if (response.status === 401) {
    window.dispatchEvent(new Event('budgetcontrol-unauthorized'));
  }

  return response;
}

export const apiClient = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestOptions) => request(path, { ...options, method: 'POST', body }),
  put: (path: string, body?: any, options?: RequestOptions) => request(path, { ...options, method: 'PUT', body }),
  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'DELETE' }),
};

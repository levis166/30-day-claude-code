const BASE = '/api';

async function req(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

const post = (url, data) => req(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

const put = (url, data) => req(url, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const fetchBikes        = ()       => req(`${BASE}/bikes`);
export const fetchBike         = (id)     => req(`${BASE}/bikes/${id}`);
export const createBike        = (data)   => post(`${BASE}/bikes`, data);
export const updateBike        = (id, d)  => put(`${BASE}/bikes/${id}`, d);
export const deleteBike        = (id)     => fetch(`${BASE}/bikes/${id}`, { method: 'DELETE' });

export const fetchComponents   = (bikeId) => req(`${BASE}/components/bike/${bikeId}`);
export const createComponent   = (data)   => post(`${BASE}/components`, data);
export const updateComponent   = (id, d)  => put(`${BASE}/components/${id}`, d);
export const deleteComponent   = (id)     => fetch(`${BASE}/components/${id}`, { method: 'DELETE' });

export const fetchRides        = (bikeId) => req(`${BASE}/bikes/${bikeId}/rides`);
export const createRide        = (data)   => post(`${BASE}/rides`, data);
export const deleteRide        = (id)     => fetch(`${BASE}/rides/${id}`, { method: 'DELETE' });

export const fetchServiceLogs  = (cId)    => req(`${BASE}/service-logs/component/${cId}`);
export const createServiceLog  = (data)   => post(`${BASE}/service-logs`, data);
export const deleteServiceLog  = (id)     => fetch(`${BASE}/service-logs/${id}`, { method: 'DELETE' });

export const fetchBikeHealth   = (bikeId) => req(`${BASE}/health/bike/${bikeId}`);

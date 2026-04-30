const BASE = '/api';

export async function fetchBikes() {
  return fetch(`${BASE}/bikes`).then(r => r.json());
}
export async function fetchBike(id) {
  return fetch(`${BASE}/bikes/${id}`).then(r => r.json());
}
export async function createBike(data) {
  return fetch(`${BASE}/bikes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
}
export async function updateBike(id, data) {
  return fetch(`${BASE}/bikes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
}
export async function deleteBike(id) {
  return fetch(`${BASE}/bikes/${id}`, { method: 'DELETE' });
}

export async function fetchComponents(bikeId) {
  return fetch(`${BASE}/components/bike/${bikeId}`).then(r => r.json());
}
export async function createComponent(data) {
  return fetch(`${BASE}/components`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
}
export async function updateComponent(id, data) {
  return fetch(`${BASE}/components/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
}
export async function deleteComponent(id) {
  return fetch(`${BASE}/components/${id}`, { method: 'DELETE' });
}

export async function fetchRides(bikeId) {
  return fetch(`${BASE}/bikes/${bikeId}/rides`).then(r => r.json());
}
export async function createRide(data) {
  return fetch(`${BASE}/rides`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
}
export async function deleteRide(id) {
  return fetch(`${BASE}/rides/${id}`, { method: 'DELETE' });
}

export async function fetchServiceLogs(componentId) {
  return fetch(`${BASE}/service-logs/component/${componentId}`).then(r => r.json());
}
export async function createServiceLog(data) {
  return fetch(`${BASE}/service-logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
}
export async function deleteServiceLog(id) {
  return fetch(`${BASE}/service-logs/${id}`, { method: 'DELETE' });
}

export async function fetchBikeHealth(bikeId) {
  return fetch(`${BASE}/health/bike/${bikeId}`).then(r => r.json());
}

const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/bike/:bikeId', (req, res) => {
  res.json(db.prepare('SELECT * FROM components WHERE bike_id = ? ORDER BY name').all(req.params.bikeId));
});

router.get('/:id', (req, res) => {
  const component = db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id);
  if (!component) return res.status(404).json({ error: 'Component not found' });
  res.json(component);
});

router.post('/', (req, res) => {
  const { bike_id, name, type, brand, installed_km = 0, install_date, replace_at_km, service_at_km, notes } = req.body;
  if (!bike_id || !name || !type) return res.status(400).json({ error: 'bike_id, name and type are required' });

  const result = db.prepare(
    'INSERT INTO components (bike_id, name, type, brand, installed_km, install_date, replace_at_km, service_at_km, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(bike_id, name, type, brand, installed_km, install_date, replace_at_km, service_at_km, notes);

  res.status(201).json(db.prepare('SELECT * FROM components WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { name, type, brand, installed_km, install_date, replace_at_km, service_at_km, notes } = req.body;
  // Use COALESCE only for required fields (name, type). Use direct assignment for nullable
  // fields so the user can clear thresholds by setting them to null in the edit modal.
  db.prepare(`
    UPDATE components SET
      name         = COALESCE(?, name),
      type         = COALESCE(?, type),
      brand        = ?,
      installed_km = COALESCE(?, installed_km),
      install_date = COALESCE(?, install_date),
      replace_at_km = ?,
      service_at_km = ?,
      notes        = ?
    WHERE id = ?
  `).run(name, type, brand, installed_km, install_date, replace_at_km, service_at_km, notes, req.params.id);
  res.json(db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM components WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

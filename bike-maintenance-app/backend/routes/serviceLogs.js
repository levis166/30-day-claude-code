const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/component/:componentId', (req, res) => {
  res.json(
    db.prepare('SELECT * FROM service_logs WHERE component_id = ? ORDER BY date DESC').all(req.params.componentId)
  );
});

router.post('/', (req, res) => {
  const { component_id, date, km_at_service, type = 'service', notes, cost } = req.body;
  if (!component_id || !date) return res.status(400).json({ error: 'component_id and date are required' });

  const result = db.prepare(
    'INSERT INTO service_logs (component_id, date, km_at_service, type, notes, cost) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(component_id, date, km_at_service, type, notes, cost);

  if (type === 'replace') {
    const component = db.prepare('SELECT * FROM components WHERE id = ?').get(component_id);
    const bikeKm = db.prepare(
      'SELECT COALESCE(SUM(distance_km), 0) as total FROM rides WHERE bike_id = ?'
    ).get(component.bike_id).total;
    db.prepare('UPDATE components SET installed_km = ?, install_date = ? WHERE id = ?')
      .run(bikeKm, date, component_id);
  }

  res.status(201).json(db.prepare('SELECT * FROM service_logs WHERE id = ?').get(result.lastInsertRowid));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM service_logs WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

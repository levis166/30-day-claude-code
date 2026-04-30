const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { bike_id, name, distance_km, date, moving_time_s, elevation_m } = req.body;
  if (!bike_id || !distance_km || !date) return res.status(400).json({ error: 'bike_id, distance_km and date are required' });

  const result = db.prepare(
    'INSERT INTO rides (bike_id, name, distance_km, date, moving_time_s, elevation_m) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(bike_id, name, distance_km, date, moving_time_s, elevation_m);

  res.status(201).json(db.prepare('SELECT * FROM rides WHERE id = ?').get(result.lastInsertRowid));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM rides WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

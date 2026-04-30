const express = require('express');
const db = require('../db');

const router = express.Router();

const DEFAULT_COMPONENTS = [
  { name: 'Chain',            type: 'drivetrain',  replace_at_km: 2500,  service_at_km: null  },
  { name: 'Cassette',         type: 'drivetrain',  replace_at_km: 12000, service_at_km: null  },
  { name: 'Front Tyre',       type: 'tyres',       replace_at_km: 4000,  service_at_km: null  },
  { name: 'Rear Tyre',        type: 'tyres',       replace_at_km: 3000,  service_at_km: null  },
  { name: 'Brake Pads Front', type: 'brakes',      replace_at_km: 3000,  service_at_km: null  },
  { name: 'Brake Pads Rear',  type: 'brakes',      replace_at_km: 3000,  service_at_km: null  },
  { name: 'Bar Tape',         type: 'cockpit',     replace_at_km: 5000,  service_at_km: null  },
  { name: 'Cables & Housing', type: 'drivetrain',  replace_at_km: 8000,  service_at_km: null  },
  { name: 'Bottom Bracket',   type: 'drivetrain',  replace_at_km: 20000, service_at_km: 10000 },
  { name: 'Fork Service',     type: 'suspension',  replace_at_km: null,  service_at_km: 3000  },
];

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM bikes ORDER BY created_at DESC').all());
});

router.get('/:id', (req, res) => {
  const bike = db.prepare('SELECT * FROM bikes WHERE id = ?').get(req.params.id);
  if (!bike) return res.status(404).json({ error: 'Bike not found' });
  res.json(bike);
});

router.post('/', (req, res) => {
  const { name, brand, model, type = 'road', install_date } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const bike = db.prepare(
    'INSERT INTO bikes (name, brand, model, type) VALUES (?, ?, ?, ?)'
  ).run(name, brand, model, type);

  const insertComponent = db.prepare(
    'INSERT INTO components (bike_id, name, type, installed_km, install_date, replace_at_km, service_at_km) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const seedComponents = db.transaction(() => {
    for (const c of DEFAULT_COMPONENTS) {
      insertComponent.run(
        bike.lastInsertRowid, c.name, c.type, 0,
        install_date || new Date().toISOString().slice(0, 10),
        c.replace_at_km, c.service_at_km
      );
    }
  });
  seedComponents();

  res.status(201).json(db.prepare('SELECT * FROM bikes WHERE id = ?').get(bike.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const { name, brand, model, type } = req.body;
  db.prepare(
    'UPDATE bikes SET name = COALESCE(?, name), brand = COALESCE(?, brand), model = COALESCE(?, model), type = COALESCE(?, type) WHERE id = ?'
  ).run(name, brand, model, type, req.params.id);
  res.json(db.prepare('SELECT * FROM bikes WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM bikes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/rides', (req, res) => {
  res.json(db.prepare('SELECT * FROM rides WHERE bike_id = ? ORDER BY date DESC').all(req.params.id));
});

module.exports = router;

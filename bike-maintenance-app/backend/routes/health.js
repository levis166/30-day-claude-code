const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/bike/:bikeId', (req, res) => {
  const bikeId = req.params.bikeId;
  const components = db.prepare('SELECT * FROM components WHERE bike_id = ?').all(bikeId);

  const health = components.map(c => {
    const kmSinceInstall = db.prepare(`
      SELECT COALESCE(SUM(distance_km), 0) as km
      FROM rides
      WHERE bike_id = ? AND date >= ?
    `).get(bikeId, c.install_date || '2000-01-01').km;

    // Use the more conservative (lower) of replace/service thresholds so dual-interval
    // components like Bottom Bracket warn at the service interval, not the replace interval.
    const candidates = [c.replace_at_km, c.service_at_km].filter(v => v != null);
    const threshold = candidates.length > 0 ? Math.min(...candidates) : null;

    const pct = threshold ? Math.min((kmSinceInstall / threshold) * 100, 100) : null;

    let status = 'ok';
    if (pct !== null) {
      if (pct >= 100) status = 'overdue';
      else if (pct >= 90) status = 'critical';
      else if (pct >= 70) status = 'warning';
    }

    return {
      ...c,
      km_since_install: Math.round(kmSinceInstall * 10) / 10,
      km_remaining: threshold ? Math.max(Math.round((threshold - kmSinceInstall) * 10) / 10, 0) : null,
      pct: pct !== null ? Math.round(pct) : null,
      status,
    };
  });

  res.json(health);
});

module.exports = router;

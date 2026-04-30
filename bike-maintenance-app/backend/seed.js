const db = require('./db');

db.exec(`
  DELETE FROM service_logs;
  DELETE FROM rides;
  DELETE FROM components;
  DELETE FROM bikes;
`);

const insertBike = db.prepare(
  'INSERT INTO bikes (name, brand, model, type) VALUES (?, ?, ?, ?)'
);

const roadBike  = insertBike.run('Canyon Ultimate', 'Canyon', 'Ultimate CF SL 8', 'road');
const gravelBike = insertBike.run('Trek Checkpoint', 'Trek',   'Checkpoint ALR 5',  'gravel');

const DEFAULT_COMPONENTS = [
  { name: 'Chain',            type: 'drivetrain', replace_at_km: 2500,  service_at_km: null  },
  { name: 'Cassette',         type: 'drivetrain', replace_at_km: 12000, service_at_km: null  },
  { name: 'Front Tyre',       type: 'tyres',      replace_at_km: 4000,  service_at_km: null  },
  { name: 'Rear Tyre',        type: 'tyres',      replace_at_km: 3000,  service_at_km: null  },
  { name: 'Brake Pads Front', type: 'brakes',     replace_at_km: 3000,  service_at_km: null  },
  { name: 'Brake Pads Rear',  type: 'brakes',     replace_at_km: 3000,  service_at_km: null  },
  { name: 'Bar Tape',         type: 'cockpit',    replace_at_km: 5000,  service_at_km: null  },
  { name: 'Cables & Housing', type: 'drivetrain', replace_at_km: 8000,  service_at_km: null  },
  { name: 'Bottom Bracket',   type: 'drivetrain', replace_at_km: 20000, service_at_km: 10000 },
  { name: 'Fork Service',     type: 'suspension', replace_at_km: null,  service_at_km: 3000  },
];

const insertComponent = db.prepare(
  'INSERT INTO components (bike_id, name, type, installed_km, install_date, replace_at_km, service_at_km) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const seedComponents = db.transaction((bikeId, installDate) => {
  for (const c of DEFAULT_COMPONENTS) {
    insertComponent.run(bikeId, c.name, c.type, 0, installDate, c.replace_at_km, c.service_at_km);
  }
});

seedComponents(roadBike.lastInsertRowid,   '2024-01-01');
seedComponents(gravelBike.lastInsertRowid, '2024-03-01');

const insertRide = db.prepare(
  'INSERT INTO rides (bike_id, name, distance_km, date, moving_time_s, elevation_m) VALUES (?, ?, ?, ?, ?, ?)'
);

const roadRides = [
  ['Morning Loop',      45.2,  '2024-01-15', 5400,  320  ],
  ['Weekend Ride',      82.5,  '2024-01-20', 10800, 650  ],
  ['Coffee Ride',       38.1,  '2024-02-03', 4500,  210  ],
  ['Long One',          120.3, '2024-02-17', 15600, 1200 ],
  ['Quick Spin',        25.0,  '2024-03-01', 3000,  150  ],
  ['Club Run',          95.7,  '2024-03-15', 12600, 800  ],
  ['Hilly Loop',        67.4,  '2024-04-01', 9000,  950  ],
  ['Recovery Ride',     30.2,  '2024-04-10', 3600,  180  ],
  ['Century Attempt',   142.8, '2024-04-28', 19200, 1400 ],
  ['Evening Blast',     42.6,  '2024-05-05', 5100,  280  ],
  ['Sunday Sportive',   110.0, '2024-05-19', 14400, 1100 ],
  ['Commute Loop',      28.3,  '2024-06-03', 3300,  90   ],
  ['Mountain Stage',    155.2, '2024-06-22', 21600, 2400 ],
  ['Tempo Session',     55.0,  '2024-07-08', 6000,  310  ],
  ['Gran Fondo',        180.5, '2024-07-27', 25200, 2800 ],
];

for (const [name, dist, date, time, elev] of roadRides) {
  insertRide.run(roadBike.lastInsertRowid, name, dist, date, time, elev);
}

const gravelRides = [
  ['Trail Explorer',    55.3,  '2024-03-10', 7200,  680  ],
  ['Gravel Grind',      78.9,  '2024-03-22', 11400, 920  ],
  ['Bikepacking Loop',  110.2, '2024-04-05', 16200, 1650 ],
  ['Forest Track',      42.1,  '2024-04-20', 5400,  540  ],
  ['Gravel Century',    102.4, '2024-05-11', 14400, 1380 ],
];

for (const [name, dist, date, time, elev] of gravelRides) {
  insertRide.run(gravelBike.lastInsertRowid, name, dist, date, time, elev);
}

// Chain replaced on road bike after ~2,650km
const roadChain = db.prepare(
  `SELECT id FROM components WHERE bike_id = ? AND name = 'Chain'`
).get(roadBike.lastInsertRowid);

db.prepare(
  'INSERT INTO service_logs (component_id, date, km_at_service, type, notes, cost) VALUES (?, ?, ?, ?, ?, ?)'
).run(roadChain.id, '2024-03-01', 2651, 'replace', 'KMC X11EL chain — worn past 0.75%', 34.99);

// Update road bike chain install to reflect the replacement
db.prepare('UPDATE components SET installed_km = ?, install_date = ? WHERE id = ?')
  .run(2651, '2024-03-01', roadChain.id);

console.log('Seed complete — 2 bikes, 20 rides, 1 service log.');

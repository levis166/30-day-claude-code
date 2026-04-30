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

const roadBike   = insertBike.run('Canyon Ultimate', 'Canyon', 'Ultimate CF SL 8', 'road');
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

// Road bike components installed Jan 2023, gravel bike March 2024
seedComponents(roadBike.lastInsertRowid,   '2023-01-01');
seedComponents(gravelBike.lastInsertRowid, '2024-03-01');

const insertRide = db.prepare(
  'INSERT INTO rides (bike_id, name, distance_km, date, moving_time_s, elevation_m) VALUES (?, ?, ?, ?, ?, ?)'
);

// ~3,942km of road rides across 18 months — puts several components into
// warning/critical/overdue so the demo shows a realistic spread of health states.
// Chain hits 2,500km around 2023-09-30 and is replaced there.
const roadRides = [
  ['New Year Spin',       68.4,  '2023-01-14', 8208,  380 ],
  ['January Base',        82.5,  '2023-01-28', 9900,  520 ],
  ['February Base',       95.2,  '2023-02-11', 11424, 580 ],
  ['Coffee Ride',         108.3, '2023-02-25', 12996, 680 ],
  ['Spring Classic',      78.4,  '2023-03-11', 9408,  620 ],
  ['Club Run',            88.2,  '2023-03-18', 10584, 580 ],
  ['March Enduro',        82.7,  '2023-03-25', 9924,  710 ],
  ['April Opener',        92.5,  '2023-04-08', 11100, 680 ],
  ['Easter Ride',         105.3, '2023-04-15', 12636, 820 ],
  ['Spring Gran Fondo',   102.8, '2023-04-29', 12336, 920 ],
  ['May Day Classic',     82.4,  '2023-05-06', 9888,  580 ],
  ['Bank Holiday Ride',   95.6,  '2023-05-13', 11472, 680 ],
  ['Sportive Prep',       88.3,  '2023-05-20', 10596, 720 ],
  ['Long One',            85.2,  '2023-05-27', 10224, 660 ],
  ['Summer Blast',        112.4, '2023-06-10', 13488, 950 ],
  ['Midsummer Ride',      108.6, '2023-06-17', 13032, 880 ],
  ['Solstice Century',    125.8, '2023-06-24', 15096, 1120],
  ['July Heatwave',       95.2,  '2023-07-01', 11424, 680 ],
  ['Mountain Stage',      118.4, '2023-07-15', 14208, 1580],
  ['Alpine Loop',         105.6, '2023-07-22', 12672, 1250],
  ['Tour de Local',       82.3,  '2023-07-29', 9876,  520 ],
  ['August Base',         98.4,  '2023-08-05', 11808, 720 ],
  ['Late Summer Loop',    105.2, '2023-08-19', 12624, 880 ],
  ['Bank Holiday Epic',   92.1,  '2023-08-26', 11052, 640 ],
  ['September Opener',    82.4,  '2023-09-02', 9888,  580 ],
  ['Autumn Classic',      88.3,  '2023-09-16', 10596, 680 ],
  ['September Closer',    78.5,  '2023-09-30', 9420,  550 ],
  ['October Miles',       98.4,  '2023-10-14', 11808, 720 ],
  ['Autumn Crunch',       105.2, '2023-10-28', 12624, 880 ],
  ['November Grind',      72.4,  '2023-11-11', 8688,  480 ],
  ['Last Long Ride',      78.3,  '2023-11-25', 9396,  540 ],
  ['Winter Base',         98.5,  '2023-12-16', 11820, 620 ],
  ['New Year Miles',      72.4,  '2024-01-13', 8688,  420 ],
  ['January Fitness',     82.5,  '2024-01-27', 9900,  530 ],
  ['February Build',      85.2,  '2024-02-10', 10224, 580 ],
  ['Pre-season Miles',    92.4,  '2024-02-24', 11088, 650 ],
  ['Spring Training',     98.3,  '2024-03-09', 11796, 680 ],
  ['March Sportive',      105.2, '2024-03-23', 12624, 820 ],
  ['April Classic',       82.4,  '2024-04-06', 9888,  580 ],
  ['Easter Training',     88.3,  '2024-04-13', 10596, 650 ],
  ['April Closer',        78.5,  '2024-04-27', 9420,  520 ],
  ['May Opener',          72.4,  '2024-05-04', 8688,  480 ],
  ['Spring Miles',        82.3,  '2024-05-18', 9876,  560 ],
];

for (const [name, dist, date, time, elev] of roadRides) {
  insertRide.run(roadBike.lastInsertRowid, name, dist, date, time, elev);
}

// Gravel bike — newer, all components healthy
const gravelRides = [
  ['Trail Explorer',    55.3,  '2024-03-10', 7200,  680 ],
  ['Gravel Grind',      78.9,  '2024-03-22', 11400, 920 ],
  ['Bikepacking Loop',  110.2, '2024-04-05', 16200, 1650],
  ['Forest Track',      42.1,  '2024-04-20', 5400,  540 ],
  ['Mud & Glory',       68.4,  '2024-04-28', 9000,  820 ],
  ['Gravel Century',    102.4, '2024-05-11', 14400, 1380],
  ['May Gravel Blast',  85.3,  '2024-05-25', 11400, 980 ],
];

for (const [name, dist, date, time, elev] of gravelRides) {
  insertRide.run(gravelBike.lastInsertRowid, name, dist, date, time, elev);
}

// Chain on road bike hit 2,500km around 2023-09-30 — log the replacement
const roadChain = db.prepare(
  `SELECT id FROM components WHERE bike_id = ? AND name = 'Chain'`
).get(roadBike.lastInsertRowid);

db.prepare(
  'INSERT INTO service_logs (component_id, date, km_at_service, type, notes, cost) VALUES (?, ?, ?, ?, ?, ?)'
).run(roadChain.id, '2023-09-30', 2549, 'replace', 'KMC X11EL — worn past 0.75% stretch', 34.99);

db.prepare('UPDATE components SET installed_km = ?, install_date = ? WHERE id = ?')
  .run(2549, '2023-09-30', roadChain.id);

// Expected health after seed (road bike):
//   Rear Tyre        3942km / 3000km  = 131% OVERDUE
//   Brake Pads x2   3942km / 3000km  = 131% OVERDUE
//   Fork Service     3942km / 3000km  = 131% OVERDUE
//   Front Tyre       3942km / 4000km  =  99% CRITICAL
//   Bar Tape         3942km / 5000km  =  79% WARNING
//   Chain            1393km / 2500km  =  56% OK
//   Cables           3942km / 8000km  =  49% OK
//   Bottom Bracket   3942km / 10000km =  39% OK (uses service interval with fix)
//   Cassette         3942km / 12000km =  33% OK
console.log('Seed complete — 2 bikes, 50 rides, 1 service log.');

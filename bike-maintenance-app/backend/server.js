const express = require('express');
const cors = require('cors');

const bikesRouter = require('./routes/bikes');
const componentsRouter = require('./routes/components');
const ridesRouter = require('./routes/rides');
const serviceLogsRouter = require('./routes/serviceLogs');
const healthRouter = require('./routes/health');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/bikes', bikesRouter);
app.use('/api/components', componentsRouter);
app.use('/api/rides', ridesRouter);
app.use('/api/service-logs', serviceLogsRouter);
app.use('/api/health', healthRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

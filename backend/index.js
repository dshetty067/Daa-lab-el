const express = require('express');
const cors = require('cors');
const avlRoutes = require('./routes/avl');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/avl', avlRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

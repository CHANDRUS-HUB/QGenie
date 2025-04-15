const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

const plagiarismRoute = require('./routes/checkPlagiarism');

app.use(bodyParser.json());
app.use('/api/plagiarism', plagiarismRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

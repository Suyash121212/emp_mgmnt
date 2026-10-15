require('dotenv').config();
console.log( process.env.MONGODB_URI);
module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_task_mgmt',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

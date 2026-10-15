const asyncHandler = require('../middleware/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardData();
  res.status(200).json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data
  });
});

module.exports = {
  getDashboard
};

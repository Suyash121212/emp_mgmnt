const Employee = require('../models/Employee');
const Task = require('../models/Task');

const getDashboardData = async () => {
  const now = new Date();

  const [employeeStatsAgg, taskStatsAgg, workloadAgg] = await Promise.all([
    Employee.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
          },
          onLeave: {
            $sum: { $cond: [{ $eq: ['$status', 'On Leave'] }, 1, 0] }
          }
        }
      }
    ]),

    Task.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'Todo'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', now] },
                    { $not: { $in: ['$status', ['Completed', 'Cancelled']] } }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]),

    Task.aggregate([
      {
        $match: {
          status: { $in: ['Todo', 'In Progress'] }
        }
      },
      {
        $group: {
          _id: '$assignedEmployee',
          activeTasks: { $sum: 1 },
          snapshotName: { $first: '$employeeSnapshot.fullName' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDoc'
        }
      },
      {
        $project: {
          _id: 0,
          employeeId: '$_id',
          employeeName: {
            $ifNull: [
              { $arrayElemAt: ['$employeeDoc.fullName', 0] },
              '$snapshotName'
            ]
          },
          activeTasks: 1
        }
      },
      {
        $sort: { activeTasks: -1 }
      }
    ])
  ]);

  const employeeStats = employeeStatsAgg[0]
    ? {
        total: employeeStatsAgg[0].total,
        active: employeeStatsAgg[0].active,
        inactive: employeeStatsAgg[0].inactive,
        onLeave: employeeStatsAgg[0].onLeave
      }
    : {
        total: 0,
        active: 0,
        inactive: 0,
        onLeave: 0
      };

  const taskStats = taskStatsAgg[0]
    ? {
        total: taskStatsAgg[0].total,
        todo: taskStatsAgg[0].todo,
        inProgress: taskStatsAgg[0].inProgress,
        completed: taskStatsAgg[0].completed,
        cancelled: taskStatsAgg[0].cancelled,
        overdue: taskStatsAgg[0].overdue
      }
    : {
        total: 0,
        todo: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0
      };

  return {
    employeeStats,
    taskStats,
    employeeWorkload: workloadAgg
  };
};

module.exports = {
  getDashboardData
};

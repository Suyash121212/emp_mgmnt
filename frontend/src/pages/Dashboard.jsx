import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineUsers, 
  HiOutlineUser, 
  HiOutlineUserRemove, 
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiPlus,
  HiArrowRight,
  HiRefresh
} from 'react-icons/hi';
import { getDashboard } from '../api/dashboardApi';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboard();
      if (response && response.success) {
        setData(response.data);
      } else {
        setData(response?.data || response || {});
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      const msg = err.extractedMessage || 'Failed to fetch dashboard data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading dashboard statistics..." />;
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
        <HiOutlineExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <HiRefresh className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const employeeStats = data?.employeeStats || { total: 0, active: 0, inactive: 0, onLeave: 0 };
  const taskStats = data?.taskStats || { total: 0, todo: 0, inProgress: 0, completed: 0, cancelled: 0, overdue: 0 };
  const employeeWorkload = data?.employeeWorkload || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">System Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time overview of workforce availability, task progress, and department workloads.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/employees/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <HiPlus className="w-4 h-4 text-gray-500" />
            <span>Add Employee</span>
          </Link>
          <Link
            to="/tasks/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <HiPlus className="w-4 h-4 text-white" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Row 1: Employee Metrics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
            <HiOutlineUsers className="w-5 h-5 text-blue-600" />
            <span>Employee Statistics</span>
          </h2>
          <Link
            to="/employees"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View all employees</span>
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={employeeStats.total}
            icon={HiOutlineUsers}
            color="blue"
          />
          <StatCard
            title="Active"
            value={employeeStats.active}
            icon={HiOutlineUser}
            color="emerald"
          />
          <StatCard
            title="Inactive"
            value={employeeStats.inactive}
            icon={HiOutlineUserRemove}
            color="rose"
          />
          <StatCard
            title="On Leave"
            value={employeeStats.onLeave}
            icon={HiOutlineCalendar}
            color="amber"
          />
        </div>
      </section>

      {/* Row 2: Task Metrics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
            <HiOutlineClipboardList className="w-5 h-5 text-indigo-600" />
            <span>Task Statistics</span>
          </h2>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View all tasks</span>
            <HiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Tasks"
            value={taskStats.total}
            icon={HiOutlineClipboardList}
            color="indigo"
          />
          <StatCard
            title="Todo"
            value={taskStats.todo}
            icon={HiOutlineClock}
            color="gray"
          />
          <StatCard
            title="In Progress"
            value={taskStats.inProgress}
            icon={HiOutlinePlay}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={taskStats.completed}
            icon={HiOutlineCheckCircle}
            color="emerald"
          />
          <StatCard
            title="Cancelled"
            value={taskStats.cancelled}
            icon={HiOutlineXCircle}
            color="rose"
          />
          <StatCard
            title="Overdue"
            value={taskStats.overdue}
            icon={HiOutlineExclamationCircle}
            color="red"
          />
        </div>
      </section>

      {/* Row 3: Employee Workload Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Employee Workload</h2>
          <span className="text-xs text-gray-500">Active tasks in Todo or In Progress</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Employee Name
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Active Tasks
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Workload Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {employeeWorkload.length > 0 ? (
                  employeeWorkload.map((item, index) => {
                    const count = item.activeTasks ?? 0;
                    let loadBadge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Light
                      </span>
                    );
                    if (count >= 5) {
                      loadBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          Heavy ({count})
                        </span>
                      );
                    } else if (count >= 3) {
                      loadBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Moderate ({count})
                        </span>
                      );
                    }

                    return (
                      <tr key={index} className="hover:bg-gray-50/75 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.employeeName || 'Unnamed'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-semibold text-gray-800">{count}</span> tasks
                        </td>
                        <td className="px-6 py-4">
                          {loadBadge}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                      No employee workload data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

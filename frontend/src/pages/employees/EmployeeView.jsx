import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiOutlinePencilAlt, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineBriefcase, 
  HiOutlineCalendar, 
  HiOutlineClipboardList,
  HiOutlineExclamationCircle,
  HiOutlineEye
} from 'react-icons/hi';
import { getEmployeeById } from '../../api/employeeApi';
import { getTasks } from '../../api/taskApi';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { formatDate, getPriorityColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function EmployeeView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getEmployeeById(id);
        const data = response.data || response;
        if (!data) {
          throw new Error('Employee not found');
        }
        setEmployee(data);
      } catch (err) {
        console.error('Error fetching employee details:', err);
        const msg = err.extractedMessage || 'Failed to load employee details.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  useEffect(() => {
    const fetchEmployeeTasks = async () => {
      if (!id) return;
      setTasksLoading(true);
      try {
        const response = await getTasks({ assignedEmployee: id, limit: 50 });
        const taskData = response.data?.tasks || response.data || [];
        setTasks(taskData);
      } catch (err) {
        console.error('Error fetching employee tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchEmployeeTasks();
  }, [id]);

  if (loading) {
    return <Loader message="Loading employee profile..." />;
  }

  if (error || !employee) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <HiOutlineExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-sm text-gray-600 mb-6">{error || 'The requested employee could not be located.'}</p>
        <Link
          to="/employees"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Employee List</span>
        </Link>
      </div>
    );
  }

  const initials = employee.fullName
    ? employee.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'EM';

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/employees"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors self-start"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/employees/${id}/edit`)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <HiOutlinePencilAlt className="w-4 h-4" />
            <span>Edit Employee</span>
          </button>
        </div>
      </div>

      {/* Main Employee Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Profile Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-gray-800 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md border-2 border-white/20 shrink-0">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">{employee.fullName}</h1>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                  {employee.employeeId}
                </span>
                <StatusBadge status={employee.status} type="employee" />
              </div>
              <p className="text-gray-300 text-sm flex items-center space-x-2">
                <span>{employee.role}</span>
                <span>•</span>
                <span className="text-blue-300 font-medium">{employee.department} Department</span>
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <HiOutlineMail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <HiOutlinePhone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{employee.phone || '-'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <HiOutlineCalendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(employee.joiningDate)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <HiOutlineBriefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department & Role</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{employee.department} - {employee.role}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
              <HiOutlineClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Task Count</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {employee.activeTaskCount !== undefined ? employee.activeTaskCount : tasks.filter(t => t.status === 'Todo' || t.status === 'In Progress').length} tasks
              </p>
            </div>
          </div>

          {employee.status === 'On Leave' && (
            <div className="flex items-start space-x-3 col-span-full bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <HiOutlineCalendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">On Leave Period</p>
                <p className="text-sm font-medium text-amber-800 mt-0.5">
                  {formatDate(employee.leaveStart)} to {formatDate(employee.leaveEnd)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="p-6 sm:p-8 bg-gray-50/50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-3">Skills & Expertise</h3>
          {Array.isArray(employee.skills) && employee.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No skills listed for this employee.</p>
          )}
        </div>
      </div>

      {/* Assigned Tasks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
            <HiOutlineClipboardList className="w-5 h-5 text-blue-600" />
            <span>Assigned Tasks ({tasks.length})</span>
          </h3>
          <Link
            to={`/tasks/new?employeeId=${employee._id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            + Assign New Task
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase">Task ID</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase">Priority</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tasksLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                    Loading assigned tasks...
                  </td>
                </tr>
              ) : tasks.length > 0 ? (
                tasks.map((task) => {
                  const priorityStyle = getPriorityColor(task.priority);
                  return (
                    <tr key={task._id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="px-6 py-4 font-semibold text-xs text-gray-800">
                        {task.taskId || 'TSK'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link to={`/tasks/${task._id}`} className="hover:text-blue-600 transition-colors">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${priorityStyle.badge}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} type="task" />
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(task.dueDate)}
                        {task.isOverdue && (
                          <span className="ml-2 text-xs font-bold text-red-600">(Overdue)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No tasks currently assigned to this employee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

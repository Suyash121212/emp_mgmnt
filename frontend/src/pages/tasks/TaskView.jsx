import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiOutlinePencilAlt, 
  HiOutlineUser, 
  HiOutlineCalendar, 
  HiOutlineClock, 
  HiOutlineOfficeBuilding, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle, 
  HiOutlineTag,
  HiOutlineSparkles
} from 'react-icons/hi';
import { getTaskById, updateTaskStatus } from '../../api/taskApi';
import StatusBadge from '../../components/common/StatusBadge';
import StatusDropdown from '../../components/common/StatusDropdown';
import Loader from '../../components/common/Loader';
import { formatDate, getPriorityColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function TaskView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTaskById(id);
      const data = response.data || response;
      if (!data) {
        throw new Error('Task not found');
      }
      setTask(data);
    } catch (err) {
      console.error('Error fetching task:', err);
      const msg = err.extractedMessage || 'Failed to load task details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      await updateTaskStatus(taskId, nextStatus);
      toast.success(`Task status changed to "${nextStatus}".`);
      fetchTaskDetails();
    } catch (err) {
      console.error('Error updating task status:', err);
      const msg = err.extractedMessage || 'Failed to update task status.';
      toast.error(msg);
    }
  };

  if (loading) {
    return <Loader message="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <HiOutlineExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Task Not Found</h2>
        <p className="text-sm text-gray-600 mb-6">{error || 'The requested task does not exist.'}</p>
        <Link
          to="/tasks"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>
      </div>
    );
  }

  const isTerminal = task.status === 'Completed' || task.status === 'Cancelled';
  const priorityStyle = getPriorityColor(task.priority);

  // Determine employee info
  const empFullName =
    task.employeeSnapshot?.fullName ||
    task.assignedEmployee?.fullName ||
    'Unassigned';

  const empId =
    task.employeeSnapshot?.employeeId ||
    task.assignedEmployee?.employeeId;

  const empEmail =
    task.employeeSnapshot?.email ||
    task.assignedEmployee?.email;

  const empDbId =
    typeof task.assignedEmployee === 'object'
      ? task.assignedEmployee?._id
      : task.assignedEmployee;

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/tasks"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors self-start"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>

        <div className="flex items-center space-x-3">
          {!isTerminal && (
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}/edit`)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
              <span>Edit Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Task View Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-6 sm:p-8 bg-gray-900 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="font-mono bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
                {task.taskId || 'TSK'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityStyle.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${priorityStyle.dot}`} />
                {task.priority} Priority
              </span>
            </div>

            {/* Current Status Badge or Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Status:</span>
              <StatusDropdown
                currentStatus={task.status}
                taskId={task._id}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            {task.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-300">
            <span className="flex items-center space-x-1">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-blue-400" />
              <span>{task.department} Department</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <HiOutlineClock className="w-4 h-4 text-gray-400" />
              <span>Created {formatDate(task.createdAt, 'MMM dd, yyyy HH:mm')}</span>
            </span>
          </div>
        </div>

        {/* Overdue Warning Alert */}
        {task.isOverdue && (
          <div className="bg-red-50 border-y border-red-200 px-6 py-3 flex items-center space-x-3 text-red-800">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-xs sm:text-sm font-semibold">
              Notice: This task is past its due date ({formatDate(task.dueDate)}) and has not been completed.
            </div>
          </div>
        )}

        {/* Description Section */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center space-x-1.5">
            <HiOutlineTag className="w-4 h-4 text-gray-400" />
            <span>Description</span>
          </h2>
          <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200/60">
            {task.description ? task.description : <span className="text-gray-400 italic">No description provided for this task.</span>}
          </div>
        </div>

        {/* Timeline & Metadata Section */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border-b border-gray-100">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
              <HiOutlineCalendar className="w-4 h-4 text-blue-500" />
              <span>Start Date</span>
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(task.startDate)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
              <HiOutlineCalendar className="w-4 h-4 text-rose-500" />
              <span>Due Date</span>
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1 flex items-center space-x-2">
              <span>{formatDate(task.dueDate)}</span>
              {task.isOverdue && (
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                  Overdue
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
              <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Completed Date</span>
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {task.completedDate ? formatDate(task.completedDate) : '-'}
            </p>
          </div>
        </div>

        {/* Assigned Employee Details Card */}
        <div className="p-6 sm:p-8 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
              <HiOutlineUser className="w-4 h-4 text-blue-500" />
              <span>Assigned Employee</span>
            </h2>
            {empDbId && (
              <Link
                to={`/employees/${empDbId}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View Employee Profile →
              </Link>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                {empFullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{empFullName}</h3>
                <div className="text-xs text-gray-500 flex items-center space-x-2 mt-0.5">
                  {empId && <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{empId}</span>}
                  {empEmail && <span>{empEmail}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">Department:</span>
              <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                {task.department}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

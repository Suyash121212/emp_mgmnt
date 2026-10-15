import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiOutlineExclamationCircle, 
  HiCheck 
} from 'react-icons/hi';
import { getTaskById, createTask, updateTask } from '../../api/taskApi';
import { getAllEmployees } from '../../api/employeeApi';
import FormField from '../../components/common/FormField';
import Loader from '../../components/common/Loader';
import { DEPARTMENTS, PRIORITIES } from '../../utils/constants';
import { formatDateForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function TaskForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Pre-fill assignedEmployee if passed via query param (e.g., from EmployeeView)
  const initialEmployeeId = searchParams.get('employeeId') || '';

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    assignedEmployee: initialEmployeeId,
    department: '',
    priority: 'Medium',
    startDate: '',
    dueDate: '',
    description: '',
  });

  // Fetch active employees for dropdown and fetch task if edit mode
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoadingInitial(true);
      try {
        // Fetch active employees
        const empResponse = await getAllEmployees({ status: 'Active' });
        const empList = empResponse.data?.employees || empResponse.data || [];
        if (isMounted) {
          setEmployees(empList);
        }

        // If edit mode, fetch existing task
        if (isEditMode) {
          const taskResponse = await getTaskById(id);
          const taskData = taskResponse.data || taskResponse;

          if (!taskData) {
            throw new Error('Task not found.');
          }

          // Rule 10: Completed/Cancelled tasks should not be editable
          if (taskData.status === 'Completed' || taskData.status === 'Cancelled') {
            toast.error(`Tasks with status "${taskData.status}" cannot be edited.`);
            navigate(`/tasks/${id}`);
            return;
          }

          if (isMounted) {
            // Also ensure the currently assigned employee is in the dropdown even if not active
            if (taskData.assignedEmployee && typeof taskData.assignedEmployee === 'object') {
              const currentAssignedId = taskData.assignedEmployee._id;
              const exists = empList.some((e) => e._id === currentAssignedId);
              if (!exists) {
                setEmployees((prev) => [taskData.assignedEmployee, ...prev]);
              }
            }

            setFormData({
              title: taskData.title || '',
              assignedEmployee:
                typeof taskData.assignedEmployee === 'object'
                  ? taskData.assignedEmployee?._id || ''
                  : taskData.assignedEmployee || '',
              department: taskData.department || '',
              priority: taskData.priority || 'Medium',
              startDate: formatDateForInput(taskData.startDate),
              dueDate: formatDateForInput(taskData.dueDate),
              description: taskData.description || '',
            });
          }
        } else if (initialEmployeeId) {
          // If pre-selecting an employee, pre-populate department if available
          const foundEmp = empList.find((e) => e._id === initialEmployeeId);
          if (foundEmp && foundEmp.department && isMounted) {
            setFormData((prev) => ({
              ...prev,
              department: foundEmp.department,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load initial task data:', err);
        const msg = err.extractedMessage || 'Failed to load task form data.';
        toast.error(msg);
        navigate('/tasks');
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, initialEmployeeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill department if employee changes and task has no department yet
    if (name === 'assignedEmployee' && value) {
      const selected = employees.find((emp) => emp._id === value);
      if (selected && selected.department && !formData.department) {
        setFormData((prev) => ({
          ...prev,
          department: selected.department,
        }));
      }
    }

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (serverError) {
      setServerError(null);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task Title is required.';
    }

    if (!formData.assignedEmployee) {
      newErrors.assignedEmployee = 'Please assign an employee to this task.';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required.';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required.';
    } else if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        newErrors.dueDate = 'Due date must be on or after Start date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      toast.error('Please resolve the errors highlighted below.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      assignedEmployee: formData.assignedEmployee,
      department: formData.department,
      priority: formData.priority,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      description: formData.description.trim(),
    };

    try {
      if (isEditMode) {
        // PUT /api/tasks/:id without status
        await updateTask(id, payload);
        toast.success('Task updated successfully.');
      } else {
        await createTask(payload);
        toast.success('Task created successfully.');
      }
      navigate('/tasks');
    } catch (err) {
      console.error('Task submit failed:', err);
      const msg = err.extractedMessage || 'Failed to save task.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return <Loader message="Loading task details..." />;
  }

  // Map employee options for dropdown: "FullName (EmployeeID) - Dept"
  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.fullName} (${emp.employeeId || 'EMP'})${emp.department ? ` - ${emp.department}` : ''}`,
  }));

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode
              ? 'Update assignment, deadline, priority, or specifications for this task.'
              : 'Specify assignment, target milestone dates, and task objectives.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Server Error Alert Box */}
          {serverError && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3">
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="text-sm text-red-800 font-medium">
                {serverError}
              </div>
            </div>
          )}

          {/* Row 1: Title & Assigned Employee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Task Title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="e.g. Implement OAuth Authentication"
              required
            />

            <FormField
              label="Assigned Employee"
              name="assignedEmployee"
              type="select"
              value={formData.assignedEmployee}
              onChange={handleChange}
              error={errors.assignedEmployee}
              options={employeeOptions}
              placeholder="Select an Employee"
              required
              helpText={employees.length === 0 ? 'No active employees found to assign.' : undefined}
            />
          </div>

          {/* Row 2: Priority & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleChange}
              error={errors.priority}
              options={PRIORITIES}
              required
            />

            <FormField
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
              options={DEPARTMENTS}
              placeholder="Select Department"
              required
            />
          </div>

          {/* Row 3: Start Date & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />

            <FormField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
              required
            />
          </div>

          {/* Description (Full Width) */}
          <FormField
            label="Task Description"
            name="description"
            type="textarea"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Provide context, acceptance criteria, deliverables, and links..."
          />

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Link
              to="/tasks"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <HiCheck className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Task' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

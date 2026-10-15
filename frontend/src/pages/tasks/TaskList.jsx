import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  HiPlus, 
  HiSearch, 
  HiX, 
  HiOutlineDownload, 
  HiOutlineEye, 
  HiOutlinePencilAlt, 
  HiOutlineTrash 
} from 'react-icons/hi';
import { 
  getTasks, 
  updateTaskStatus, 
  deleteTask, 
  exportTasksCsv 
} from '../../api/taskApi';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import FilterBar from '../../components/common/FilterBar';
import StatusDropdown from '../../components/common/StatusDropdown';
import ActionMenu from '../../components/common/ActionMenu';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, getPriorityColor } from '../../utils/helpers';
import { DEPARTMENTS, PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL query parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const dueDateFrom = searchParams.get('dueDateFrom') || '';
  const dueDateTo = searchParams.get('dueDateTo') || '';
  const sortBy = searchParams.get('sortBy') || 'dueDate';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  // Local state
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;

  // Confirm delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch tasks data from backend
  const fetchTasksData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (department) params.department = department;
      if (priority) params.priority = priority;
      if (status) params.status = status;
      if (dueDateFrom) params.dueDateFrom = dueDateFrom;
      if (dueDateTo) params.dueDateTo = dueDateTo;

      const response = await getTasks(params);
      if (response && response.success) {
        setTasks(response.data?.tasks || []);
        setTotalItems(response.data?.total || 0);
        setTotalPages(response.data?.pages || 1);
      } else {
        const data = response?.data || {};
        setTasks(data.tasks || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      const msg = err.extractedMessage || 'Failed to fetch tasks list.';
      toast.error(msg);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, priority, status, dueDateFrom, dueDateTo, sortBy, sortOrder]);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  // Update URL Search Parameters
  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    if (!('page' in updates)) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateSearchParams({ search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateSearchParams({ search: '' });
  };

  const handleFilterChange = (key, value) => {
    updateSearchParams({ [key]: value });
  };

  const handleClearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (sortBy) newParams.set('sortBy', sortBy);
    if (sortOrder) newParams.set('sortOrder', sortOrder);
    setSearchInput('');
    setSearchParams(newParams);
  };

  const handleSort = (newSortBy, newSortOrder) => {
    updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  // Status Change Handler using dedicated status endpoint
  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      await updateTaskStatus(taskId, nextStatus);
      toast.success(`Task status changed to "${nextStatus}".`);
      fetchTasksData();
    } catch (err) {
      console.error('Status transition error:', err);
      const msg = err.extractedMessage || 'Failed to update task status.';
      toast.error(msg);
    }
  };

  // Export CSV with current filters (omitting page and limit)
  const handleExportCsv = async () => {
    setExporting(true);
    const toastId = toast.loading('Exporting tasks to CSV...');
    try {
      const exportParams = {};
      if (search) exportParams.search = search;
      if (department) exportParams.department = department;
      if (priority) exportParams.priority = priority;
      if (status) exportParams.status = status;
      if (dueDateFrom) exportParams.dueDateFrom = dueDateFrom;
      if (dueDateTo) exportParams.dueDateTo = dueDateTo;

      await exportTasksCsv(exportParams);
      toast.success('Tasks CSV downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('CSV export failed:', err);
      const msg = err.extractedMessage || 'Failed to export CSV.';
      toast.error(msg, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleOpenDeleteDialog = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      toast.success(`Task "${taskToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      if (tasks.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        fetchTasksData();
      }
    } catch (err) {
      console.error('Task deletion failed:', err);
      const msg = err.extractedMessage || 'Failed to delete task.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      key: 'taskId',
      label: 'ID',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
          {row.taskId || 'TSK'}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <Link
          to={`/tasks/${row._id}`}
          className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          title={row.title}
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: 'employee',
      label: 'Employee',
      sortable: false,
      render: (row) => {
        const name =
          row.employeeSnapshot?.fullName ||
          row.assignedEmployee?.fullName ||
          'Unassigned';
        const empId =
          row.employeeSnapshot?.employeeId ||
          row.assignedEmployee?.employeeId;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{name}</span>
            {empId && <span className="text-[11px] text-gray-400">{empId}</span>}
          </div>
        );
      },
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {row.department}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (row) => {
        const style = getPriorityColor(row.priority);
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
            {row.priority}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <StatusDropdown
          currentStatus={row.status}
          taskId={row._id}
          onStatusChange={handleStatusChange}
        />
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-700">{formatDate(row.dueDate)}</span>
          {row.isOverdue && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
              Overdue
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => {
        const isTerminalStatus = row.status === 'Completed' || row.status === 'Cancelled';
        const menuItems = [
          {
            label: 'View',
            icon: HiOutlineEye,
            onClick: () => navigate(`/tasks/${row._id}`),
          },
        ];

        if (!isTerminalStatus) {
          menuItems.push({
            label: 'Edit',
            icon: HiOutlinePencilAlt,
            onClick: () => navigate(`/tasks/${row._id}/edit`),
          });
        }

        menuItems.push({
          label: 'Delete',
          icon: HiOutlineTrash,
          color: 'red',
          onClick: () => handleOpenDeleteDialog(row),
        });

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  const filterConfigs = [
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      placeholder: 'All Departments',
      options: DEPARTMENTS,
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      placeholder: 'All Priorities',
      options: PRIORITIES,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'All Statuses',
      options: TASK_STATUSES,
    },
    {
      key: 'dueDateFrom',
      label: 'Due From',
      type: 'date',
    },
    {
      key: 'dueDateTo',
      label: 'Due To',
      type: 'date',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize workloads, assign tasks to employees, monitor statuses, and track overdue deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            type="button"
            disabled={exporting}
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <HiOutlineDownload className="w-4 h-4 text-gray-600" />
            <span>{exporting ? 'Exporting...' : 'Export To CSV'}</span>
          </button>

          <Link
            to="/tasks/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      {/* Search Bar & Filter Row */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, ID, or employee..."
              className="w-full pl-10 pr-9 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        <FilterBar
          filters={filterConfigs}
          values={{ department, priority, status, dueDateFrom, dueDateTo }}
          onChange={handleFilterChange}
          onClear={handleClearAllFilters}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tasks}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage={
          search || department || priority || status || dueDateFrom || dueDateTo
            ? 'No tasks match the active filters.'
            : 'No tasks found. Click "+ Add Task" to create a new task.'
        }
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        itemName="tasks"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}" (${taskToDelete?.taskId})? This action cannot be undone.`}
        confirmText="Delete Task"
        confirmColor="red"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </div>
  );
}

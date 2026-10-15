import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  HiPlus, 
  HiSearch, 
  HiX, 
  HiOutlineEye, 
  HiOutlinePencilAlt, 
  HiOutlineTrash 
} from 'react-icons/hi';
import { getEmployees, deleteEmployee } from '../../api/employeeApi';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import FilterBar from '../../components/common/FilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import ActionMenu from '../../components/common/ActionMenu';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Local state for search input text
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Confirm delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize local search input when URL changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch employees when URL params change
  const fetchEmployeesData = useCallback(async () => {
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
      if (status) params.status = status;

      const response = await getEmployees(params);
      if (response && response.success) {
        setEmployees(response.data?.employees || []);
        setTotalItems(response.data?.total || 0);
        setTotalPages(response.data?.pages || 1);
      } else {
        const data = response?.data || {};
        setEmployees(data.employees || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      const msg = err.extractedMessage || 'Failed to fetch employees list.';
      toast.error(msg);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployeesData();
  }, [fetchEmployeesData]);

  // Helper to update URL search params
  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 unless updating page itself
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

  const handleOpenDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(employeeToDelete._id);
      toast.success(`Employee ${employeeToDelete.fullName} deleted successfully.`);
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
      // If we are on a page that becomes empty after deletion, consider previous page
      if (employees.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        fetchEmployeesData();
      }
    } catch (err) {
      console.error('Delete employee failed:', err);
      const msg = err.extractedMessage || 'Failed to delete employee.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Define table columns
  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded text-xs border border-gray-200">
          {row.employeeId}
        </span>
      ),
    },
    {
      key: 'fullName',
      label: 'Full Name',
      sortable: true,
      render: (row) => (
        <Link
          to={`/employees/${row._id}`}
          className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {row.fullName}
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => <span className="text-gray-600">{row.email}</span>,
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} type="employee" />,
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      sortable: true,
      render: (row) => <span className="text-gray-600">{formatDate(row.joiningDate)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <ActionMenu
          items={[
            {
              label: 'View',
              icon: HiOutlineEye,
              onClick: () => navigate(`/employees/${row._id}`),
            },
            {
              label: 'Edit',
              icon: HiOutlinePencilAlt,
              onClick: () => navigate(`/employees/${row._id}/edit`),
            },
            {
              label: 'Delete',
              icon: HiOutlineTrash,
              color: 'red',
              onClick: () => handleOpenDeleteDialog(row),
            },
          ]}
        />
      ),
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
      key: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'All Statuses',
      options: EMPLOYEE_STATUSES,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your company roster, roles, departments, and active statuses.
          </p>
        </div>

        <Link
          to="/employees/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors self-start sm:self-auto"
        >
          <HiPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, ID, or email..."
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
          values={{ department, status }}
          onChange={handleFilterChange}
          onClear={handleClearAllFilters}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        emptyMessage={
          search || department || status
            ? 'No employees match the applied filter criteria.'
            : 'No employees found. Click "+ Add Employee" to create your first employee.'
        }
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        itemName="employees"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.fullName} (${employeeToDelete?.employeeId})? This action cannot be undone.`}
        confirmText="Delete Employee"
        confirmColor="red"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </div>
  );
}

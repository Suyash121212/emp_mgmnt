import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiOutlineExclamationCircle, 
  HiCheck 
} from 'react-icons/hi';
import { 
  getEmployeeById, 
  createEmployee, 
  updateEmployee 
} from '../../api/employeeApi';
import FormField from '../../components/common/FormField';
import Loader from '../../components/common/Loader';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../utils/constants';
import { formatDateForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joiningDate: '',
    status: 'Active',
    skills: [],
    leaveStart: '',
    leaveEnd: '',
  });

  useEffect(() => {
    if (!isEditMode) return;

    const fetchEmployee = async () => {
      setLoadingInitial(true);
      try {
        const response = await getEmployeeById(id);
        const data = response.data || response;
        if (data) {
          setFormData({
            employeeId: data.employeeId || '',
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            role: data.role || '',
            joiningDate: formatDateForInput(data.joiningDate),
            status: data.status || 'Active',
            skills: Array.isArray(data.skills) ? data.skills : [],
            leaveStart: formatDateForInput(data.leaveStart),
            leaveEnd: formatDateForInput(data.leaveEnd),
          });
        }
      } catch (err) {
        console.error('Failed to load employee for editing:', err);
        const msg = err.extractedMessage || 'Failed to load employee details.';
        toast.error(msg);
        navigate('/employees');
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchEmployee();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error upon typing
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    // Clear general server error
    if (serverError) {
      setServerError(null);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required (e.g., EMP-001).';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required.';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role / Job Title is required.';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining Date is required.';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.';
    }

    if (formData.status === 'On Leave') {
      if (!formData.leaveStart) {
        newErrors.leaveStart = 'Leave start date is required when status is On Leave.';
      }
      if (!formData.leaveEnd) {
        newErrors.leaveEnd = 'Leave end date is required when status is On Leave.';
      }
      if (formData.leaveStart && formData.leaveEnd) {
        if (new Date(formData.leaveEnd) < new Date(formData.leaveStart)) {
          newErrors.leaveEnd = 'Leave End date must be on or after Leave Start date.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setSubmitting(true);

    const payload = {
      employeeId: formData.employeeId.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department,
      role: formData.role.trim(),
      joiningDate: formData.joiningDate,
      status: formData.status,
      skills: formData.skills,
    };

    if (formData.status === 'On Leave') {
      payload.leaveStart = formData.leaveStart;
      payload.leaveEnd = formData.leaveEnd;
    } else {
      payload.leaveStart = null;
      payload.leaveEnd = null;
    }

    try {
      if (isEditMode) {
        await updateEmployee(id, payload);
        toast.success('Employee updated successfully.');
      } else {
        await createEmployee(payload);
        toast.success('Employee created successfully.');
      }
      navigate('/employees');
    } catch (err) {
      console.error('Save employee error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Validation errors:', err.validationErrors);
      
      // Show validation errors if available
      if (err.validationErrors && err.validationErrors.length > 0) {
        const errorMsg = err.validationErrors.join('; ');
        setServerError(errorMsg);
        toast.error(errorMsg);
      } else {
        const msg = err.extractedMessage || 'Failed to save employee.';
        setServerError(msg);
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return <Loader message="Loading employee information..." />;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back button & Page title */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode
              ? `Update employee profile and company attributes for ${formData.fullName || 'Employee'}`
              : 'Fill in the information below to register a new employee.'}
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

          {/* Row 1: Employee ID & Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Employee ID"
              name="employeeId"
              type="text"
              value={formData.employeeId}
              onChange={handleChange}
              error={errors.employeeId}
              placeholder="e.g. EMP-101"
              required
              disabled={isEditMode}
              helpText={isEditMode ? 'Employee ID cannot be changed.' : 'Unique identifier for employee'}
            />

            <FormField
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="e.g. Jane Doe"
              required
            />
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g. jane.doe@company.com"
              required
            />

            <FormField
              label="Phone Number"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g. +1 555-0199"
              required
            />
          </div>

          {/* Row 3: Department & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <FormField
              label="Role / Designation"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          {/* Row 4: Joining Date & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleChange}
              error={errors.joiningDate}
              required
            />

            <FormField
              label="Employment Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              options={EMPLOYEE_STATUSES}
              required
            />
          </div>

          {/* Conditional Row: Leave Dates (Only when On Leave) */}
          {formData.status === 'On Leave' && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-4">
              <h3 className="text-sm font-semibold text-amber-900">Leave Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Leave Start Date"
                  name="leaveStart"
                  type="date"
                  value={formData.leaveStart}
                  onChange={handleChange}
                  error={errors.leaveStart}
                  required
                />

                <FormField
                  label="Leave End Date"
                  name="leaveEnd"
                  type="date"
                  value={formData.leaveEnd}
                  onChange={handleChange}
                  error={errors.leaveEnd}
                  required
                />
              </div>
            </div>
          )}

          {/* Skills (Multiselect / Tag input) */}
          <FormField
            label="Skills"
            name="skills"
            type="multiselect"
            value={formData.skills}
            onChange={handleChange}
            error={errors.skills}
            placeholder="Type skill and press Enter (e.g. React, Node.js, SQL)..."
            helpText="Add technologies, proficiencies, or domain skills"
          />

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Link
              to="/employees"
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
                  <span>{isEditMode ? 'Update Employee' : 'Create Employee'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

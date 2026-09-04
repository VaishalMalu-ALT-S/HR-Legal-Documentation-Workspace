import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, Briefcase, 
  MapPin, Calendar, DollarSign, FileSpreadsheet, Trash2, Edit, Eye, X, Check
} from 'lucide-react';
import { Employee, Contractor, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';

interface PeopleMasterProps {
  employees: Employee[];
  contractors: Contractor[];
  currentRole: UserRole;
  onNavigateToWizard: (personId: string, personType: 'employee' | 'contractor') => void;
}

export const PeopleMaster: React.FC<PeopleMasterProps> = ({
  employees,
  contractors,
  currentRole,
  onNavigateToWizard
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'contractors'>('employees');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const [selectedPerson, setSelectedPerson] = useState<Employee | Contractor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Adding Employee
  const [newEmp, setNewEmp] = useState(() => ({
    employeeId: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    email: '',
    phone: '',
    department: 'Enterprise Applications',
    designation: '',
    employmentType: 'Full-Time' as const,
    dateOfJoining: new Date().toISOString().split('T')[0],
    workLocation: 'Chennai Office',
    reportingManager: 'Umamaheshwari. S',
    salaryCtc: 1200000,
    panNumber: '',
    address: ''
  }));

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
                          e.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredContractors = contractors.filter(c => {
    return c.fullName.toLowerCase().includes(search.toLowerCase()) || 
           c.contractorId.toLowerCase().includes(search.toLowerCase()) ||
           c.role.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.fullName || !newEmp.email) return;
    DatabaseService.addEmployee(newEmp);
    setShowAddModal(false);
    setNewEmp({
      employeeId: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      email: '',
      phone: '',
      department: 'Enterprise Applications',
      designation: '',
      employmentType: 'Full-Time',
      dateOfJoining: new Date().toISOString().split('T')[0],
      workLocation: 'Chennai Office',
      reportingManager: 'Umamaheshwari. S',
      salaryCtc: 1200000,
      panNumber: '',
      address: ''
    });
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      DatabaseService.deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-heading">People Master Database</h1>
          <p className="text-xs text-slate-500">Centralized database for employees and fixed-term contractors</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Subtabs */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('employees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'employees' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employees ({employees.length})
            </button>
            <button
              onClick={() => setActiveSubTab('contractors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'contractors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contractors ({contractors.length})
            </button>
          </div>

          {(currentRole === 'super_admin' || currentRole === 'hr_admin') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
            >
              <UserPlus size={15} /> Add {activeSubTab === 'employees' ? 'Employee' : 'Contractor'}
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeSubTab} by name, ID, or designation...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
          />
        </div>

        {activeSubTab === 'employees' && (
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Enterprise Applications">Enterprise Applications</option>
              <option value="Administration & HR">Administration & HR</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>
        )}
      </div>

      {/* EMPLOYEES TABLE VIEW */}
      {activeSubTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Annual CTC</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">{emp.employeeId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-400">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{emp.designation}</div>
                      <div className="text-[10px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="py-3 px-4">{emp.dateOfJoining}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      ₹{(emp.salaryCtc || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {emp.employmentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPerson(emp)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onNavigateToWizard(emp.id, 'employee')}
                          className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] border border-brand-200"
                          title="Generate Appointment Letter / Form"
                        >
                          Gen Doc
                        </button>
                        {(currentRole === 'super_admin' || currentRole === 'hr_admin') && (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTRACTORS TABLE VIEW */}
      {activeSubTab === 'contractors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Contractor ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Contract Tenure</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredContractors.map(con => (
                  <tr key={con.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{con.contractorId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{con.fullName}</div>
                      <div className="text-[11px] text-slate-400">{con.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{con.role}</div>
                      <div className="text-[10px] text-slate-500">{con.companyName}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <span className="font-medium text-slate-900">{con.contractStartDate}</span> to <span className="font-medium text-slate-900">{con.contractEndDate}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      {con.rateCompensation}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPerson(con)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onNavigateToWizard(con.id, 'contractor')}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200"
                        >
                          Gen Offer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">Add New Employee Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Employee ID</label>
                  <input
                    type="text"
                    value={newEmp.employeeId}
                    onChange={e => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={newEmp.fullName}
                    onChange={e => setNewEmp({ ...newEmp, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Babu"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={newEmp.email}
                    onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="ramesh@alt-s.in"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={newEmp.phone}
                    onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Department</label>
                  <input
                    type="text"
                    value={newEmp.department}
                    onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Designation</label>
                  <input
                    type="text"
                    value={newEmp.designation}
                    onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })}
                    placeholder="e.g. Senior SAP Consultant"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Annual CTC (INR)</label>
                  <input
                    type="number"
                    value={newEmp.salaryCtc}
                    onChange={e => setNewEmp({ ...newEmp, salaryCtc: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Date of Joining</label>
                  <input
                    type="date"
                    value={newEmp.dateOfJoining}
                    onChange={e => setNewEmp({ ...newEmp, dateOfJoining: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

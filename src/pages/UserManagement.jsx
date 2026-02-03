import React, { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical, ChevronLeft, ChevronRight, SquarePen, BadgeCheck, BadgeAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getALlUser, updateUser } from '../services/api';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('Any Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkRole, setBulkRole] = useState('');
  const [showSuspendDropdown, setShowSuspendDropdown] = useState(false);
  const [suspendingUserId, setSuspendingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await getALlUser();
      if (response.data.success) {
        setUsers(response.data.data);
        return toast.success("Fetch Sucessfully");
      } else {
        return toast.error("error Fetching Users");
      }
    } catch (error) {
      return toast.error(error.message);
    }
  }

  const handleBulkRoleChange = async (role) => {
    setBulkRole(role);

    // Example payload
    const payload = {
      userIds: selectedUsers,
      role
    };

    console.log('Bulk role update:', payload);

    // TODO: call API here
    // await bulkUpdateRole(payload);

    toast.success(`Role updated to ${role}`);
    setBulkRole('');
    setSelectedUsers([]);
  };


  useEffect(() => {
    fetchUsers();
  }, [])

  useEffect(() => {
    console.log('USER OBJECT:', users[0]);
  }, [users]);


  const getStatusBadge = (user) => {

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">● Locked</span>;
    }
    if (!user.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">● Inactive</span>;
    }
    if (user.loginAttempts >= 5) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">● Locked</span>;
    }
    if (!user.isEmailVerified) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">● Pending</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">● Active</span>;
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">Administrator</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300">User</span>;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLockUntil = (duration) => {
    const now = new Date();

    switch (duration) {
      case '1h':
        now.setHours(now.getHours() + 1);
        break;
      case '24h':
        now.setDate(now.getDate() + 1);
        break;
      case '7d':
        now.setDate(now.getDate() + 7);
        break;
      case 'permanent':
        return new Date('2099-12-31');
      default:
        return null;
    }
    return now;
  };

  const suspendUser = async (user, duration) => {
    if (!user) {
      toast.error('No user selected');
      return;
    }

    try {
      const lockUntil = getLockUntil(duration);

      const res = await updateUser(user.id, { lockUntil });

      if (res.data.success) {
        toast.success(`User suspended (${duration})`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to suspend user'
      );
    } finally {
      setShowSuspendDropdown(false);
      setSuspendingUserId(null);
      setSelectedUsers([]);
    }
  };

  const formatLockUntil = (lockUntil) => {
    if (!lockUntil) return 'Not suspended';

    const lockDate = new Date(lockUntil);
    const now = new Date();

    if (lockDate <= now) {
      return 'Expired';
    }

    return lockDate.toLocaleString(); // nice readable format
  };

  const unsuspendUser = async (user) => {
    try {
      const res = await updateUser(user.id, {
        lockUntil: null,
        isActive: true
      });

      if (res.data.success) {
        toast.success('User unsuspended');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to unsuspend user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await deleteUserApi(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'All Roles' ||
      user.role === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'Any Status' ||
      (statusFilter === 'Active' && user.isActive) ||
      (statusFilter === 'Inactive' && !user.isActive) ||
      (statusFilter === 'Pending' && !user.isEmailVerified) ||
      (statusFilter === 'Locked' &&
        user.lockUntil &&
        new Date(user.lockUntil) > new Date());


    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">▶</span>
          </div>
          <span className="text-xl font-bold">MovieStream</span>
        </div>

        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:bg-slate-800 transition">
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:bg-slate-800 transition">
            <span className="text-lg">📚</span>
            <span>Content Library</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded bg-purple-600/20 text-purple-400">
            <span className="text-lg">👥</span>
            <span>Users</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:bg-slate-800 transition">
            <span className="text-lg">📈</span>
            <span>Analytics</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:bg-slate-800 transition">
            <span className="text-lg">⭐</span>
            <span>Reviews</span>
          </a>
        </nav>

        <div className="mt-8 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 uppercase mb-2 px-3">System</p>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:bg-slate-800 transition">
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:bg-slate-800 transition">
            <span className="text-lg">🔒</span>
            <span>Permissions</span>
          </a>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Alexander</p>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
            <button className="text-slate-400 hover:text-slate-200">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">User Management</h1>
              <p className="text-slate-400">Manage access, roles, and user details.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                <span className="text-xl">🔔</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-medium">
                <Plus size={18} />
                Add User
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name, email or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>User</option>
            </select>
            <select
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Any Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
              <option>Locked</option>
            </select>
            <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition">
              <span className="text-lg">☰</span>
            </button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mb-4 flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-sm font-semibold">
                  {selectedUsers.length}
                </span>
                <span className="text-sm text-slate-200">
                  Users selected
                </span>
              </div>

              <div className="flex items-center gap-3">
                {selectedUsers.length === 1 && (
                  <select
                    value={bulkRole}
                    onChange={(e) => handleBulkRoleChange(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
                    <option value="" disabled>
                      Change Role
                    </option>
                    <option value="admin">Administrator</option>
                    <option value="user">User</option>
                  </select>
                )}
                <div className="relative">
                  <button
                    disabled={
                      selectedUsers.length !== 1 ||
                      (() => {
                        const user = users.find(u => u.id === selectedUsers[0]);
                        return user?.lockUntil && new Date(user.lockUntil) > new Date();
                      })()
                    }
                    onClick={() => {
                      setSuspendingUserId(selectedUsers[0]);
                      setShowSuspendDropdown(prev => !prev);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition
    ${selectedUsers.length !== 1
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600'}`}
                  >
                    Suspend
                  </button>
                  {showSuspendDropdown && (
                    <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                      {[
                        { label: '1 Hour', value: '1h' },
                        { label: '24 Hours', value: '24h' },
                        { label: '7 Days', value: '7d' },
                        { label: 'Permanent', value: 'permanent' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() =>
                            suspendUser(
                              users.find(u => u.id === suspendingUserId),
                              opt.value
                            )
                          }
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => deleteUser(1)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium transition">
                  Delete
                </button>
              </div>
            </div>
          )}


          {/* Table */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-sm font-medium text-slate-400 w-12">
                    <input type="checkbox" className="rounded" disabled />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Active</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Email Verified</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Lock Until</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          setSelectedUsers(prev =>
                            e.target.checked
                              ? [...prev, user.id]
                              : prev.filter(id => id !== user.id)
                          );
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">{getStatusBadge(user)}</td>
                    <td className="p-4">
                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <BadgeCheck size={18} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400">
                          <BadgeAlert size={18} />
                          Pending
                        </span>
                      )}

                    </td>
                    <td className="p-4">
                      {user.lockUntil && new Date(user.lockUntil) > new Date() ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                            Suspended
                          </span>
                          <button
                            onClick={() => unsuspendUser(user)}
                            className="text-xs text-purple-400 hover:underline"
                          >
                            Unsuspend
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not suspended</span>
                      )}

                    </td>

                    <td className="p-4">
                      <button className="text-slate-400 hover:text-slate-200 transition">
                        <SquarePen />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
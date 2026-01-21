import React, { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical, ChevronLeft, ChevronRight, SquarePen, BadgeCheck, BadgeAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getALlUser } from '../services/api';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('Any Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [users,setUsers] = useState([]);

  const fetchUsers = async() => {
    try {
        const response = await getALlUser();
        if(response.data.success){
            setUsers(response.data.data);
            return toast.success("Fetch Sucessfully");
        }else{
            return toast.error("error Fetching Users");
        }
    } catch (error) {
        return toast.error(error.message);
    }
  }

  useEffect(()=>{
    fetchUsers();
  },[])

  const getStatusBadge = (user) => {
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
              <option>Administrator</option>
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
                {users.map((user,index) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" disabled />
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
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <BadgeAlert size={18} />
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{user.lockUntil ? user.lockUntil : "Not yet"}</td>
                    <td className="p-4">
                      <button className="text-slate-400 hover:text-slate-200 transition">
                        <SquarePen/>
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
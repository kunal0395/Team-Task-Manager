import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 p-5 flex flex-col">
      <h1 className="text-2xl font-bold">Task Manager</h1>
      <p className="text-slate-400 text-sm mt-1">
        {user?.globalRole?.toUpperCase()} PANEL
      </p>

      <nav className="mt-8 space-y-3 flex-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? 'block bg-slate-800 px-4 py-3 rounded-xl'
              : 'block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800'
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive
              ? 'block bg-slate-800 px-4 py-3 rounded-xl'
              : 'block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800'
          }
        >
          Projects
        </NavLink>
      </nav>

      <div className="mb-4 rounded-2xl bg-slate-800 p-4 text-sm text-slate-300">
        {user?.globalRole === 'admin'
          ? 'Admin can create projects, add members, and manage tasks.'
          : 'Member can view assigned projects and update task status.'}
      </div>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-3 font-medium"
      >
        Logout
      </button>
    </aside>
  );
}
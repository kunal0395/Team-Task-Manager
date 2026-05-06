import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../api/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

const greetingText = (name) => {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name}`;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/dashboard');
        setStats(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };
    load();
  }, []);

  const maxTasks = stats
    ? Math.max(...Object.values(stats.tasksPerUser || { a: 1 }), 1)
    : 1;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-2">Overview of your projects and tasks</p>
          </div>

          <div className="w-full lg:w-auto rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-right">
            <div className="text-slate-400 text-sm">Welcome</div>
            <div className="text-lg font-semibold">
              {user ? greetingText(user.name) : 'Good day'}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard label="Total Projects" value={stats?.totalProjects ?? 0} />
          <StatCard label="Total Tasks" value={stats?.totalTasks ?? 0} />
          <StatCard label="To Do" value={stats?.todo ?? 0} />
          <StatCard label="In Progress" value={stats?.inProgress ?? 0} />
          <StatCard label="Done" value={stats?.done ?? 0} />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Overdue tasks</h2>
          <div className="text-3xl font-bold">{stats?.overdueTasks ?? 0}</div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks per user</h2>
          <div className="space-y-4">
            {stats && Object.keys(stats.tasksPerUser || {}).length > 0 ? (
              Object.entries(stats.tasksPerUser).map(([name, count]) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{name}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${Math.max(10, (count / maxTasks) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500">No task data yet</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
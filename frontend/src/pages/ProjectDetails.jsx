import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../api/api';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const emptyTaskForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Medium',
  assignedTo: '',
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [showTask, setShowTask] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [showProjectEdit, setShowProjectEdit] = useState(false);

  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [editingTask, setEditingTask] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  const loadDetails = async () => {
    const { data } = await api.get(`/api/projects/${id}`);
    setData(data);
    setProjectForm({
      name: data.project.name || '',
      description: data.project.description || '',
    });
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const isAdmin = useMemo(() => {
    if (!data || !user) return false;
    if (user.globalRole === 'admin') return true;
    return data.members?.some(
      (m) => String(m.userId?._id) === String(user?._id) && m.role === 'admin'
    );
  }, [data, user]);

  const handleStatusChange = async (taskId, status) => {
    setError('');
    try {
      const { data: updated } = await api.patch(`/api/tasks/${taskId}/status`, { status });
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t._id === taskId ? updated : t)),
      }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...taskForm,
        projectId: id,
        assignedTo: taskForm.assignedTo === '' ? null : taskForm.assignedTo,
      };

      const { data: newTask } = await api.post('/api/tasks', payload);

      setData((prev) => ({
        ...prev,
        tasks: [newTask, ...(prev.tasks || [])],
      }));

      setShowTask(false);
      setTaskForm(emptyTaskForm);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
        status: editingTask.status,
        assignedTo: editingTask.assignedTo === '' ? null : editingTask.assignedTo,
      };

      const { data: updated } = await api.put(`/api/tasks/${editingTask._id}`, payload);

      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t._id === updated._id ? updated : t)),
      }));

      setEditingTask(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeleteTask = async (task) => {
    setError('');
    const ok = window.confirm(`Delete task "${task.title}"?`);
    if (!ok) return;

    try {
      await api.delete(`/api/tasks/${task._id}`);
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t._id !== task._id),
      }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post(`/api/projects/${id}/members`, {
        email: memberEmail,
        role: memberRole,
      });

      setShowMember(false);
      setMemberEmail('');
      setMemberRole('member');
      loadDetails();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.put(`/api/projects/${id}`, projectForm);
      setShowProjectEdit(false);
      loadDetails();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeleteProject = async () => {
    setError('');
    const ok = window.confirm(`Delete project "${data.project.name}" and all its tasks?`);
    if (!ok) return;

    try {
      await api.delete(`/api/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{data.project.name}</h1>
            <p className="text-slate-400 mt-2">{data.project.description || 'No description'}</p>
          </div>

          {isAdmin && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowTask(true)}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500"
              >
                + Add Task
              </button>
              <button
                onClick={() => setShowMember(true)}
                className="rounded-xl bg-slate-800 px-5 py-3 font-medium hover:bg-slate-700"
              >
                + Add Member
              </button>
              <button
                onClick={() => setShowProjectEdit(true)}
                className="rounded-xl bg-amber-600 px-5 py-3 font-medium hover:bg-amber-500"
              >
                Edit Project
              </button>
              <button
                onClick={handleDeleteProject}
                className="rounded-xl bg-red-600 px-5 py-3 font-medium hover:bg-red-500"
              >
                Delete Project
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            {data.tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) =>
                  setEditingTask({
                    ...t,
                    dueDate: t.dueDate ? String(t.dueDate).slice(0, 10) : '',
                    assignedTo: t.assignedTo?._id || '',
                  })
                }
                onDelete={handleDeleteTask}
                canManage={isAdmin}
              />
            ))}
          </section>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="space-y-3">
              {data.members.map((m) => (
                <div key={m._id} className="rounded-xl bg-slate-800 px-4 py-3">
                  <div className="font-medium">{m.userId.name}</div>
                  <div className="text-xs text-slate-400">{m.userId.email}</div>
                  <div className="text-xs text-slate-500 mt-1">Role: {m.role}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {showTask && (
          <Modal title="Add Task" onClose={() => setShowTask(false)}>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
              <textarea
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none min-h-28"
                placeholder="Description"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                }
              />
              <select
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={taskForm.assignedTo}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {data.members.map((m) => (
                  <option key={m.userId._id} value={m.userId._id}>
                    {m.userId.name}
                  </option>
                ))}
              </select>
              <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500">
                Create Task
              </button>
            </form>
          </Modal>
        )}

        {showProjectEdit && (
          <Modal title="Edit Project" onClose={() => setShowProjectEdit(false)}>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <input
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                placeholder="Project name"
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, name: e.target.value })
                }
              />
              <textarea
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none min-h-28"
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, description: e.target.value })
                }
              />
              <button className="rounded-xl bg-amber-600 px-5 py-3 font-medium hover:bg-amber-500">
                Save Changes
              </button>
            </form>
          </Modal>
        )}

        {showMember && (
          <Modal title="Add Member" onClose={() => setShowMember(false)}>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                placeholder="User email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <select
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500">
                Add Member
              </button>
            </form>
          </Modal>
        )}

        {editingTask && (
          <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <input
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                placeholder="Task title"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
              />
              <textarea
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none min-h-28"
                placeholder="Description"
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, description: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={editingTask.dueDate}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                }
              />
              <select
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={editingTask.priority}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, priority: e.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={editingTask.status}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, status: e.target.value })
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              <select
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                value={editingTask.assignedTo}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {data.members.map((m) => (
                  <option key={m.userId._id} value={m.userId._id}>
                    {m.userId.name}
                  </option>
                ))}
              </select>
              <button className="rounded-xl bg-amber-600 px-5 py-3 font-medium hover:bg-amber-500">
                Save Task
              </button>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
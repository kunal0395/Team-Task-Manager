import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../api/api';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const loadProjects = async () => {
    const { data } = await api.get('/api/projects');
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/projects', { name, description });
      setShowCreate(false);
      setName('');
      setDescription('');
      loadProjects();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          {user?.globalRole === 'admin' && (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500"
            >
              + Create Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {showCreate && (
          <Modal title="Create Project" onClose={() => setShowCreate(false)}>
            <form onSubmit={createProject} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 text-red-300 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <input
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none min-h-28"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium hover:bg-indigo-500">
                Create
              </button>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
}
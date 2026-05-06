import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-600 transition"
    >
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-slate-400 text-sm mt-2">
        {project.description || 'No description'}
      </p>
      <div className="text-xs text-slate-500 mt-4">
        Your role: {project.myRole}
      </div>
    </Link>
  );
}
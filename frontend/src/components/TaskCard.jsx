export default function TaskCard({ task, onStatusChange, onEdit, onDelete, canManage }) {
  const statusClass =
    task.status === 'To Do'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : task.status === 'In Progress'
      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-lg font-semibold">{task.title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full border ${statusClass}`}>
              {task.status}
            </span>
          </div>

          <p className="text-slate-400 text-sm mt-2">
            {task.description || 'No description'}
          </p>

          <div className="text-xs text-slate-500 mt-3 space-y-1">
            <div>Priority: {task.priority}</div>
            <div>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</div>
            <div>Assigned to: {task.assignedTo?.name || 'Unassigned'}</div>
          </div>

          {canManage && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onEdit(task)}
                className="text-sm px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task)}
                className="text-sm px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <select
          className="bg-slate-800 rounded-xl px-4 py-2"
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      </div>
    </div>
  );
}
export default function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
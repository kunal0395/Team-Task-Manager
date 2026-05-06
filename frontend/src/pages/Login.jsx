import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8"
      >
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-slate-400 mt-2">Sign in to your account</p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full mt-6 rounded-xl bg-indigo-600 py-3 font-medium hover:bg-indigo-500">
          Login
        </button>

        <p className="text-sm text-slate-400 mt-4">
          New user?{' '}
          <Link to="/signup" className="text-indigo-400">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
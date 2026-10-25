import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match"); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, type, placeholder, autocomplete) => (
    <input
      type={type}
      autoComplete={autocomplete}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      required
      placeholder={placeholder}
      className="w-full bg-sp-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-sp-muted focus:outline-none focus:border-sp-green/50 focus:bg-sp-card transition-all caret-sp-green"
    />
  );

  return (
    <div className="min-h-screen bg-sp-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sp-green flex items-center justify-center mb-4 neon-glow">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black">
              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm4.1 13c-.17.28-.54.36-.82.2-2.26-1.38-5.1-1.69-8.44-.93-.32.07-.64-.13-.71-.45-.07-.32.12-.64.44-.71 3.63-.83 6.74-.47 9.27 1.07.28.17.36.55.19.82zm1.1-2.44c-.21.35-.66.46-1 .25-2.58-1.59-6.52-2.05-9.57-1.12-.4.12-.81-.1-.93-.5-.12-.4.1-.81.5-.93 3.49-1.06 7.83-.54 10.8 1.28.34.2.45.66.24 1zm.09-2.54c-3.1-1.84-8.22-2.01-11.18-1.11-.47.14-.97-.12-1.11-.59-.14-.47.12-.97.59-1.11 3.4-1.03 9.06-.83 12.63 1.28.42.25.56.79.31 1.21-.25.42-.79.56-1.22.31z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white">{t('brand')}</h1>
          <p className="text-sp-muted text-sm mt-1">{t('registerTitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm text-sp-muted mb-1.5">{t('name')}</label>
            {field('name', 'text', 'Your name', 'name')}</div>
          <div><label className="block text-sm text-sp-muted mb-1.5">{t('email')}</label>
            {field('email', 'email', 'you@example.com', 'email')}</div>
          <div><label className="block text-sm text-sp-muted mb-1.5">{t('password')}</label>
            {field('password', 'password', 'Min. 8 characters', 'new-password')}</div>
          <div><label className="block text-sm text-sp-muted mb-1.5">{t('confirmPassword')}</label>
            {field('confirm', 'password', 'Repeat password', 'new-password')}</div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sp-green text-black font-bold rounded-xl hover:bg-sp-green-alt transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="flex items-center justify-center gap-2 pointer-events-none">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /><span>{t('register')}</span></>
                : <span>{t('register')}</span>
              }
            </span>
          </button>
        </form>

        <p className="text-center text-sm text-sp-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sp-green hover:underline font-medium">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}

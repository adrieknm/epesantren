import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/');
    } else {
      setError('Email atau password salah');
    }
    
    setLoading(false);
  };

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ePesantren</h1>
          <p className="text-gray-600 mt-2">Sistem Manajemen Kelas</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Masuk ke Akun</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="email@epesantren.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700">
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDemoInfo(!showDemoInfo)}
              className="text-sm text-gray-600 hover:text-emerald-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Akun Demo untuk Testing
            </button>
            
            {showDemoInfo && (
              <div className="mt-4 space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-3">Klik untuk login cepat:</p>
                
                <button
                  onClick={() => quickLogin('admin@epesantren.com', 'admin123')}
                  className="w-full text-left px-3 py-2 bg-white rounded border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">👤 Administrator</div>
                  <div className="text-gray-600 text-xs">admin@epesantren.com / admin123</div>
                </button>
                
                <button
                  onClick={() => quickLogin('pengelola@epesantren.com', 'pengelola123')}
                  className="w-full text-left px-3 py-2 bg-white rounded border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">👔 Pengelola Kelas</div>
                  <div className="text-gray-600 text-xs">pengelola@epesantren.com / pengelola123</div>
                </button>
                
                {/* Removed Santri and Wali Santri roles */}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 ePesantren. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;

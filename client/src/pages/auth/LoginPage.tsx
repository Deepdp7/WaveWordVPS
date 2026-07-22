import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <p className="text-muted text-sm mt-2">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" variant="primary" className="w-full" disabled={loading} onClick={handleLogin}>
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-muted">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

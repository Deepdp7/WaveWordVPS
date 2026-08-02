import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { Eye, EyeOff } from 'lucide-react';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/signup', { name, email, password, phone });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-muted text-sm mt-2">Get started with our premium hosting</p>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>
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
              <label className="text-sm font-medium">Phone (Optional)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={loading} onClick={handleSignup}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

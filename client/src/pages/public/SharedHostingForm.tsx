import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export const SharedHostingForm = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requirements: '',
    domain: '',
    duration: '12',
  });

  const pricing = {
    '1': 599,
    '3': 499,
    '6': 399,
    '12': 249
  };

  const calculateTotal = () => {
    const months = parseInt(formData.duration);
    const pricePerMonth = pricing[formData.duration as keyof typeof pricing];
    return months * pricePerMonth;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a request');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const message = `
Shared Hosting Request
----------------------
Requirements: ${formData.requirements}
Domain: ${formData.domain || 'N/A'}
Duration: ${formData.duration} Months
Price: ₹${pricing[formData.duration as keyof typeof pricing]}/month (Total: ₹${calculateTotal()})
      `.trim();

      await apiClient.post('/support', {
        subject: '[Shared Hosting Request] ' + (formData.domain || 'New Request'),
        message: message
      });
      
      toast.success('Request submitted successfully! Admin will review and approve your plan.');
      setFormData({ requirements: '', domain: '', duration: '12' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Custom Shared Hosting
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Tell us what you need, and we'll set up the perfect shared hosting environment for you. 
          Fill out the form below to get started.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <Card className="border-border/50 shadow-xl shadow-primary/5">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Hosting Requirements</CardTitle>
                <CardDescription>Submit your request and our admins will review and provision your plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">What kind of website are you hosting?</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="e.g., A WordPress blog with about 5000 monthly visitors, need PHP 8.1 and MySQL..."
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain Name (Optional)</label>
                  <input 
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Duration</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { months: '1', price: 599 },
                      { months: '3', price: 499 },
                      { months: '6', price: 399 },
                      { months: '12', price: 249 },
                    ].map((plan) => (
                      <div 
                        key={plan.months}
                        onClick={() => setFormData({...formData, duration: plan.months})}
                        className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${
                          formData.duration === plan.months 
                            ? 'border-primary bg-primary/10 shadow-md shadow-primary/20' 
                            : 'border-border hover:border-primary/50 hover:bg-surface'
                        }`}
                      >
                        <div className="font-bold text-lg">{plan.months} {plan.months === '1' ? 'Month' : 'Months'}</div>
                        <div className="text-sm text-muted">₹{plan.price}/mo</div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-surface/50 border-t border-border mt-6 pt-6">
                {!isAuthenticated ? (
                  <div className="w-full flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-5" />
                      <span className="text-sm font-medium">You need to be logged in to submit a request.</span>
                    </div>
                    <Link to="/login" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors">
                      Login
                    </Link>
                  </div>
                ) : (
                  <Button type="submit" variant="primary" className="w-full py-6 text-lg" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                    {!loading && <Send className="ml-2 size-5" />}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-surface to-background border-border">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Duration</span>
                <span className="font-medium">{formData.duration} Months</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">Monthly Price</span>
                <span className="font-medium">₹{pricing[formData.duration as keyof typeof pricing]}</span>
              </div>
              
              <div className="pt-4 border-t border-border flex justify-between items-end">
                <span className="font-medium">Total Price</span>
                <span className="text-3xl font-bold text-primary">₹{calculateTotal()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-surface/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg mb-4">What happens next?</h3>
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5"><div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</div></div>
                <p className="text-sm text-muted">You submit your hosting requirements.</p>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5"><div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</div></div>
                <p className="text-sm text-muted">Our admin reviews your request and approves the best setup.</p>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5"><div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</div></div>
                <p className="text-sm text-muted">Your custom plan is provisioned and ready to use!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

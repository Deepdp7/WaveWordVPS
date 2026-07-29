import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HardDrive, Server, Loader2, FileText, MessageSquare } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'subs' | 'invoices' | 'tickets'>('subs');
  const [data, setData] = useState<any>({ subs: [], invoices: [], tickets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New ticket state
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [subsRes, invRes, tickRes] = await Promise.all([
        apiClient.get('/subscriptions/me'),
        apiClient.get('/invoices/me'),
        apiClient.get('/support/tickets/me')
      ]);
      setData({
        subs: subsRes.data,
        invoices: invRes.data,
        tickets: tickRes.data
      });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/support/tickets', newTicket);
      setNewTicket({ subject: '', message: '' });
      toast.success('Support ticket created successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>;

  return (
    <div className="pt-24 pb-12 w-full px-4 sm:px-8 lg:px-12 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="flex gap-4 mb-8 border-b border-border">
        <button 
          onClick={() => setActiveTab('subs')} 
          className={`pb-4 px-2 font-medium ${activeTab === 'subs' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
        >
          My Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('invoices')} 
          className={`pb-4 px-2 font-medium ${activeTab === 'invoices' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
        >
          Billing & Invoices
        </button>
        <button 
          onClick={() => setActiveTab('tickets')} 
          className={`pb-4 px-2 font-medium ${activeTab === 'tickets' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
        >
          Support Tickets
        </button>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subs' && (
        <div className="grid md:grid-cols-2 gap-6">
          {data.subs.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-surface border border-border rounded-xl">
              <p className="text-muted mb-4">You don't have any active subscriptions.</p>
              <Link to="/plans/static">
                <Button variant="primary">Browse Plans</Button>
              </Link>
            </div>
          ) : (
            data.subs.map((sub: any) => (
              <Card key={sub.id} className="relative">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                  <div className="flex items-center gap-2">
                    {sub.plan.type === 'vps' ? <Server className="text-primary size-5" /> : <HardDrive className="text-primary size-5" />}
                    <CardTitle>{sub.plan.name}</CardTitle>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${sub.status === 'active' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Since</span>
                      <span className="font-medium">{new Date(sub.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Renews</span>
                      <span className="font-medium">{new Date(sub.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="size-5" /> Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {data.invoices.length === 0 ? (
              <p className="text-muted text-center py-8">No invoices found.</p>
            ) : (
              <div className="space-y-4">
                {data.invoices.map((inv: any) => (
                  <div key={inv.id} className="flex justify-between items-center p-4 rounded-lg border border-border bg-surface">
                    <div>
                      <p className="font-medium text-text">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted">For: {inv.order.plan.name} • {new Date(inv.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{inv.order.amount}</p>
                      <Link to={`/invoice/${inv.id}`}>
                        <Button variant="outline" size="sm" className="mt-1 h-7 text-xs">View & Download Bill</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {data.tickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted">
                  <MessageSquare className="size-12 mx-auto mb-4 opacity-20" />
                  No support tickets found.
                </CardContent>
              </Card>
            ) : (
              data.tickets.map((ticket: any) => (
                <Card key={ticket.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full border ${ticket.status === 'open' ? 'bg-orange-500/20 text-orange-700 border-orange-500/30' : 'bg-green-500/20 text-green-700 border-green-500/30'}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted">Created on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text bg-surface p-3 rounded border border-border">{ticket.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open a Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={newTicket.subject}
                      onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="w-full rounded bg-surface border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={newTicket.message}
                      onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                      className="w-full rounded bg-surface border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    ></textarea>
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

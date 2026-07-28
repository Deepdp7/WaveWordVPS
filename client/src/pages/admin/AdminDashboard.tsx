import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Activity, HardDrive, Cpu, Network, Eye, EyeOff } from 'lucide-react';

const ServerHealthPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((username === 'admin' || username === 'deepdp') && password === '1414') {
      setIsAuthenticated(true);
    } else {
      toast.error('Invalid credentials');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchHealth = async () => {
      try {
        const res = await apiClient.get('/admin/server-health');
        setHealthData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-20">
        <Card className="w-96 shadow-lg border-border">
          <CardHeader>
            <CardTitle>Server Health Login</CardTitle>
            <p className="text-sm text-muted">Protected panel requires authentication.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 pr-10" 
                    required 
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
              <Button type="submit" className="w-full">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!healthData) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin size-8 text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-sm border-border bg-surface">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Cpu /></div>
            <div>
              <p className="text-sm text-muted">CPU Load</p>
              <h3 className="text-2xl font-bold">{healthData.cpu.toFixed(1)}%</h3>
            </div>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(healthData.cpu, 100)}%` }}></div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-border bg-surface">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg"><Activity /></div>
            <div>
              <p className="text-sm text-muted">RAM Usage</p>
              <h3 className="text-2xl font-bold">{((healthData.memory.used / healthData.memory.total) * 100).toFixed(1)}%</h3>
            </div>
          </div>
          <p className="text-xs text-muted mb-2">{(healthData.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / {(healthData.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB</p>
          <div className="w-full bg-background rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(healthData.memory.used / healthData.memory.total) * 100}%` }}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border bg-surface">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><HardDrive /></div>
            <div>
              <p className="text-sm text-muted">Disk Storage</p>
              <h3 className="text-2xl font-bold">{((healthData.disk.used / healthData.disk.total) * 100).toFixed(1)}%</h3>
            </div>
          </div>
          <p className="text-xs text-muted mb-2">{(healthData.disk.used / 1024 / 1024 / 1024).toFixed(1)} GB / {(healthData.disk.total / 1024 / 1024 / 1024).toFixed(1)} GB</p>
          <div className="w-full bg-background rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(healthData.disk.used / healthData.disk.total) * 100}%` }}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border bg-surface">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg"><Network /></div>
            <div>
              <p className="text-sm text-muted">Network I/O</p>
              <h3 className="text-xl font-bold text-green-500 text-sm">↓ {(healthData.network.rx / 1024 / 1024).toFixed(2)} MB/s</h3>
              <h3 className="text-xl font-bold text-red-500 text-sm">↑ {(healthData.network.tx / 1024 / 1024).toFixed(2)} MB/s</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'customers' | 'orders' | 'tickets' | 'home server' | 'server health'>('overview');
  const [stats, setStats] = useState<any>({ mrr: 0, subs: 0, vps: 0, tickets: 0 });
  const [data, setData] = useState<any>({ orders: [], plans: [], customers: [], tickets: [], vps: [] });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '', type: 'static', priceMonthly: 0, price1Year: '', price2Year: '', price3Year: ''
  });
  
  // Refresh data function
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, subsRes, vpsRes, plansRes, customersRes, ticketsRes] = await Promise.all([
        apiClient.get('/admin/orders'),
        apiClient.get('/admin/subscriptions'),
        apiClient.get('/admin/vps'),
        apiClient.get('/admin/plans'),
        apiClient.get('/admin/customers'),
        apiClient.get('/admin/support/tickets')
      ]);
      
      setData({
        orders: ordersRes.data,
        plans: plansRes.data,
        customers: customersRes.data,
        tickets: ticketsRes.data,
        vps: vpsRes.data
      });

      setStats({
        mrr: subsRes.data.reduce((acc: number, sub: any) => acc + (sub.plan.priceMonthly || 0), 0),
        subs: subsRes.data.length,
        vps: vpsRes.data.filter((v: any) => v.status === 'provisioning').length,
        tickets: ticketsRes.data.filter((t: any) => t.status === 'open').length
      });
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateTicket = async (id: string, status: string) => {
    try {
      await apiClient.put(`/admin/support/tickets/${id}`, { status });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProvisionVps = async (id: string, ipAddress: string) => {
    try {
      await apiClient.put(`/admin/vps/${id}/provision`, { ipAddress });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        priceMonthly: parseFloat(formData.priceMonthly),
        price1Year: formData.price1Year ? parseFloat(formData.price1Year) : null,
        price2Year: formData.price2Year ? parseFloat(formData.price2Year) : null,
        price3Year: formData.price3Year ? parseFloat(formData.price3Year) : null,
        storageGb: formData.storageGb ? parseInt(formData.storageGb) : null,
        vcpu: formData.vcpu ? parseInt(formData.vcpu) : null,
        ramGb: formData.ramGb ? parseInt(formData.ramGb) : null
      };

      if (editingPlanId) {
        await apiClient.put(`/admin/plans/${editingPlanId}`, payload);
      } else {
        await apiClient.post('/admin/plans', payload);
      }
      
      setIsFormOpen(false);
      setEditingPlanId(null);
      setFormData({ name: '', type: 'static', priceMonthly: 0, price1Year: '', price2Year: '', price3Year: '' });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to save plan', err);
    }
  };

  const handleEditClick = (plan: any) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      type: plan.type,
      priceMonthly: plan.priceMonthly,
      price1Year: plan.price1Year || '',
      price2Year: plan.price2Year || '',
      price3Year: plan.price3Year || '',
      storageGb: plan.storageGb || '',
      vcpu: plan.vcpu || '',
      ramGb: plan.ramGb || ''
    });
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingPlanId(null);
    setFormData({ name: '', type: 'static', priceMonthly: 0, price1Year: '', price2Year: '', price3Year: '' });
    setIsFormOpen(true);
  };

  if (loading && data.plans.length === 0) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>;

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAdminData}>Refresh Data</Button>
          <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white" onClick={async () => {
            if (confirm('Are you sure you want to completely RESET the database? All users and orders will be lost!')) {
              const res = await apiClient.post('/admin/reset-db');
              if (res.status === 200) {
                toast.success('Database reset successful! Please login again with the new admin credentials.', { duration: 5000 });
                window.location.href = '/login';
              }
            }
          }}>Reset Database</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-2">
        {['overview', 'plans', 'customers', 'orders', 'tickets', 'home server', 'server health'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)} 
            className={`px-4 py-2 rounded-lg font-medium capitalize ${activeTab === tab ? 'bg-primary text-white' : 'text-muted hover:bg-surface'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'home server' && (
        <Card className="shadow-sm border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-xl">Terminal Interface (ttyd)</CardTitle>
          </CardHeader>
          <CardContent className="h-[75vh]">
            <iframe 
              src="https://server.waveword.in" 
              className="w-full h-full border-0 rounded-lg bg-black"
              title="Home Server Terminal"
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'server health' && <ServerHealthPanel />}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-muted text-sm font-medium mb-1">Total MRR</h3>
                <p className="text-3xl font-bold text-primary">₹{stats.mrr}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-muted text-sm font-medium mb-1">Active Subs</h3>
                <p className="text-3xl font-bold">{stats.subs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-muted text-sm font-medium mb-1">Pending VPS</h3>
                <p className="text-3xl font-bold text-red-500">{stats.vps}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-muted text-sm font-medium mb-1">Open Tickets</h3>
                <p className="text-3xl font-bold text-orange-500">{stats.tickets}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.orders.slice(0,5).map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-surface/50">
                      <div>
                        <p className="font-medium text-sm">Order #{order.id.slice(0,8)}</p>
                        <p className="text-xs text-muted">{order.user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending VPS Provisioning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.vps.filter((v: any) => v.status === 'provisioning').length === 0 ? (
                    <p className="text-muted text-center py-4">No pending VPS</p>
                  ) : data.vps.filter((v: any) => v.status === 'provisioning').map((vps: any) => (
                    <div key={vps.id} className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Sub #{vps.subscriptionId.slice(0,6)}</span>
                        <span className="text-xs bg-red-500/20 text-red-700 px-2 py-1 rounded">PENDING</span>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const ip = (e.currentTarget.elements.namedItem('ip') as HTMLInputElement).value;
                        handleProvisionVps(vps.id, ip);
                      }} className="flex gap-2">
                        <input name="ip" type="text" required placeholder="Assign IP Address..." className="flex-1 bg-surface border border-border rounded px-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                        <Button type="submit" variant="primary" size="sm">Mark Active</Button>
                      </form>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'plans' && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Hosting Plans</CardTitle>
            <Button variant="primary" size="sm" onClick={handleCreateClick}>
              <Plus className="size-4 mr-2" /> Create Plan
            </Button>
          </CardHeader>
          
          {isFormOpen && (
            <CardContent className="border-b border-border bg-surface/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{editingPlanId ? 'Edit Plan' : 'New Plan Details'}</h3>
                <button onClick={() => setIsFormOpen(false)}><X className="size-5 text-muted hover:text-text" /></button>
              </div>
              <form onSubmit={handleSavePlan} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Plan Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Plan Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary">
                    <option value="static">Static Hosting</option>
                    <option value="lite_vps">Lite VPS Hosting</option>
                    <option value="vps">VPS Hosting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Monthly Price (₹)</label>
                  <input type="number" required value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">1-Year Price /mo (₹)</label>
                  <input type="number" value={formData.price1Year || ''} onChange={e => setFormData({...formData, price1Year: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">2-Year Price /mo (₹)</label>
                  <input type="number" value={formData.price2Year || ''} onChange={e => setFormData({...formData, price2Year: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Storage (GB)</label>
                  <input type="number" value={formData.storageGb || ''} onChange={e => setFormData({...formData, storageGb: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </div>
                {['vps', 'lite_vps'].includes(formData.type) && (
                  <>
                    <div>
                      <label className="block text-sm text-muted mb-1">vCPU Cores</label>
                      <input type="number" value={formData.vcpu || ''} onChange={e => setFormData({...formData, vcpu: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-1">RAM (GB)</label>
                      <input type="number" value={formData.ramGb || ''} onChange={e => setFormData({...formData, ramGb: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </>
                )}
                <div className="col-span-2 mt-2">
                  <Button type="submit" variant="primary">{editingPlanId ? 'Update Plan' : 'Save Plan'}</Button>
                </div>
              </form>
            </CardContent>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="p-4 font-medium text-muted">Name</th>
                  <th className="p-4 font-medium text-muted">Type</th>
                  <th className="p-4 font-medium text-muted">Price</th>
                  <th className="p-4 font-medium text-muted">Status</th>
                  <th className="p-4 font-medium text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.plans.map((plan: any) => (
                  <tr key={plan.id} className="border-b border-border hover:bg-surface/50">
                    <td className="p-4 font-medium">{plan.name}</td>
                    <td className="p-4 capitalize">{plan.type}</td>
                    <td className="p-4">₹{plan.priceMonthly}/mo</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${plan.isActive ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                        {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'customers' && (
        <Card>
          <CardHeader><CardTitle>Customers</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="p-4 font-medium text-muted">Name</th>
                  <th className="p-4 font-medium text-muted">Email</th>
                  <th className="p-4 font-medium text-muted">Role</th>
                  <th className="p-4 font-medium text-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((user: any) => (
                  <tr key={user.id} className="border-b border-border hover:bg-surface/50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-muted">{user.email}</td>
                    <td className="p-4 capitalize">{user.role}</td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader><CardTitle>Orders History</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="p-4 font-medium text-muted">ID</th>
                  <th className="p-4 font-medium text-muted">Customer</th>
                  <th className="p-4 font-medium text-muted">Amount</th>
                  <th className="p-4 font-medium text-muted">Status</th>
                  <th className="p-4 font-medium text-muted">Date</th>
                  <th className="p-4 font-medium text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border hover:bg-surface/50">
                    <td className="p-4 font-mono text-xs">{order.id.slice(0,8)}</td>
                    <td className="p-4">{order.user.email}</td>
                    <td className="p-4 font-medium">₹{order.amount}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {order.invoices && order.invoices.length > 0 && (
                        <a href={`/invoice/${order.invoices[0].id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 text-xs">View Bill</Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {data.tickets.map((ticket: any) => (
            <Card key={ticket.id}>
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                <div>
                  <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                  <p className="text-xs text-muted mt-1">From: {ticket.user.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${ticket.status === 'open' ? 'bg-orange-500/20 text-orange-700 border-orange-500/30' : 'bg-green-500/20 text-green-700 border-green-500/30'}`}>
                  {ticket.status.toUpperCase()}
                </span>
              </CardHeader>
              <CardContent>
                <div className="bg-surface p-4 rounded-lg border border-border mb-4">
                  <p className="text-sm">{ticket.message}</p>
                </div>
                {ticket.status === 'open' && (
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleUpdateTicket(ticket.id, 'closed')}>
                      Mark Resolved
                    </Button>
                    <Button variant="primary" size="sm">
                      Reply (Email)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

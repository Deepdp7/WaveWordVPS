import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Activity, HardDrive, Cpu, Network, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

export const ServerHealthDashboard = () => {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
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
  }, []);

  if (!healthData) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin size-8 text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
      <Card className="shadow-sm border-border bg-surface">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Cpu /></div>
            <div>
              <p className="text-sm text-muted">CPU Load</p>
              <h3 className="text-2xl font-bold">{healthData.cpu.toFixed(1)}%</h3>
            </div>
          </div>
          <p className="text-xs text-muted mb-2">Temp: {healthData.temperature > -1 ? `${healthData.temperature.toFixed(1)} °C` : 'N/A'}</p>
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

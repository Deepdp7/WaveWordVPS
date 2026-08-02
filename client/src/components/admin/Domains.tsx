import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Globe, Loader2, Link2, Server } from 'lucide-react';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface Domain {
  hostname: string;
  service: string;
  isActive?: boolean;
}

export const Domains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/domains');
      setDomains(res.data);
    } catch (err) {
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const toggleDomain = async (hostname: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      // Optimistic update
      setDomains(domains.map(d => d.hostname === hostname ? { ...d, isActive: newStatus } : d));
      
      const res = await apiClient.post('/admin/domains/toggle', { 
        hostname, 
        isActive: newStatus 
      });
      
      if (res.data.success) {
        toast.success(`Domain ${hostname} turned ${newStatus ? 'ON' : 'OFF'}`);
      } else {
        throw new Error('Failed to toggle');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to toggle domain');
      // Revert optimistic update on error
      fetchDomains();
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <Card className="w-full h-full bg-surface border-border overflow-hidden flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2">
          <Globe className="text-primary" /> Connected Domains
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32 text-muted">
            <Loader2 className="animate-spin size-8" />
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center p-8 text-muted">
            <Globe className="size-12 mx-auto mb-4 opacity-50" />
            <p>No domains connected yet.</p>
          </div>
        ) : (
          <div className="flex flex-row md:grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto pb-4 snap-x no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
            {domains.map((domain, i) => (
              <Card key={i} className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 shrink-0 snap-center bg-background border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${domain.isActive !== false ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                          <Globe size={20} />
                        </div>
                        <h3 className={`font-semibold truncate text-lg ${domain.isActive === false ? 'text-muted-foreground line-through decoration-muted-foreground/50' : ''}`} title={domain.hostname}>
                          {domain.hostname}
                        </h3>
                      </div>
                      
                      <button
                        onClick={() => toggleDomain(domain.hostname, domain.isActive !== false)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          domain.isActive !== false ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            domain.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-muted text-sm mb-4">
                      <Server size={14} />
                      <span className="break-all" title={domain.service}>
                        Routes to: {domain.service}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://${domain.hostname}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                      domain.isActive !== false 
                        ? 'bg-secondary/20 hover:bg-secondary/40 text-secondary-foreground' 
                        : 'bg-muted/20 text-muted-foreground pointer-events-none opacity-50'
                    }`}
                    onClick={(e) => {
                      if (domain.isActive === false) e.preventDefault();
                    }}
                  >
                    <Link2 size={16} /> Visit Site
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

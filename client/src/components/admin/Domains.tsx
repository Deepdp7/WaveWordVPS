import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Globe, Loader2, Link2, Server } from 'lucide-react';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

interface Domain {
  hostname: string;
  service: string;
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain, i) => (
              <Card key={i} className="bg-background border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-primary/20 text-primary rounded-lg">
                        <Globe size={20} />
                      </div>
                      <h3 className="font-semibold truncate text-lg" title={domain.hostname}>
                        {domain.hostname}
                      </h3>
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
                    className="flex items-center justify-center gap-2 w-full py-2 bg-secondary/20 hover:bg-secondary/40 text-secondary-foreground rounded-lg transition-colors text-sm font-medium"
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

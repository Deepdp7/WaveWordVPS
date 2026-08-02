import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check, Zap, Server, HardDrive, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

export const PlansPage = () => {
  const { type } = useParams<{ type: 'static' | 'vps' | 'lite_vps' }>();
  const isVps = type === 'vps';
  const isLiteVps = type === 'lite_vps';
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/plans?type=${type}`);
        setPlans(res.data);
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [type]);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>;

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {isVps ? 'Cloud VPS Hosting' : isLiteVps ? 'Lite VPS Hosting' : 'Shared Web Hosting'}
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          {isVps 
            ? 'High-performance virtual private servers for your growing applications.'
            : isLiteVps
              ? 'Affordable, entry-level virtual private servers for smaller projects.'
              : 'Fast, secure, and reliable hosting for your personal or business website.'}
        </p>
      </div>

      <div className="flex flex-row md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto pb-8 snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {plans.map((plan: any) => (
          <Card key={plan.id} className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center shrink-0 flex flex-col relative transition-transform md:hover:-translate-y-2 md:hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            {(plan.name.includes('Professional') || plan.name.includes('VPS 2')) && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4 flex flex-col items-center justify-center gap-1">
                {(plan.price2Year || plan.price1Year) ? <span className="text-sm text-muted">Starting from</span> : null}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">₹{plan.price2Year || plan.price1Year || plan.priceMonthly}</span>
                  <span className="text-muted">/mo</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="space-y-4 mb-6">
                {(isVps || isLiteVps) ? (
                  <>
                    <div className="flex items-center gap-3 text-muted"><Zap className="size-5 text-primary"/> {plan.vcpu} vCPU</div>
                    <div className="flex items-center gap-3 text-muted"><Server className="size-5 text-primary"/> {plan.ramGb} GB RAM</div>
                    <div className="flex items-center gap-3 text-muted"><HardDrive className="size-5 text-primary"/> {plan.storageGb} GB NVMe</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-muted"><HardDrive className="size-5 text-primary"/> {plan.storageGb} GB Storage</div>
                    <div className="flex items-center gap-3 text-muted"><Server className="size-5 text-primary"/> {plan.websiteLimit ? `${plan.websiteLimit} Websites` : 'Unlimited Websites'}</div>
                  </>
                )}
              </div>
              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm"><Check className="size-4 text-green-500 shrink-0" /> Free SSL Certificate</div>
                <div className="flex items-center gap-3 text-sm"><Check className="size-4 text-green-500 shrink-0" /> 99.9% Uptime Guarantee</div>
                {(isVps || isLiteVps) && <div className="flex items-center gap-3 text-sm"><Check className="size-4 text-green-500 shrink-0" /> Full Root Access</div>}
                {(plan.priceMonthly > 200) && <div className="flex items-center gap-3 text-sm"><Check className="size-4 text-green-500 shrink-0" /> Priority Support</div>}
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/checkout/${plan.id}`} className="w-full">
                <Button className="w-full" variant={(plan.name.includes('Professional') || plan.name.includes('VPS 2')) ? 'primary' : 'secondary'}>
                  Select Plan
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Server, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [plan, setPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'1_month' | '1_year' | '2_years' | '3_years'>('1_year');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Hardcoded to light mode as per request
  const isDarkMode = false;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchPlan = async () => {
      try {
        const res = await apiClient.get(`/plans/${planId}`);
        setPlan(res.data);
      } catch (err) {
        setError('Failed to load plan details');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, isAuthenticated, navigate]);

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const orderRes = await apiClient.post('/orders', {
        planId,
        billingCycle,
        quantity
      });

      const { orderId } = orderRes.data;
      
      const paymentRes = await apiClient.post('/orders/webhook', {
        orderId,
        rzpPaymentId: 'mock_pay_' + Math.random().toString(36).slice(2),
        status: 'success'
      });

      if (paymentRes.data.status === 'ok') {
        toast.success('Payment successful!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log out and log in again.');
      } else {
        toast.error('Checkout failed: ' + (err.response?.data?.error || err.message));
      }
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin text-[#673de6] size-8" /></div>;
  if (error || !plan) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

  const baseMonthly = plan.priceMonthly;
  const renewalPrice = Math.round(baseMonthly * 1.3); // Fake renewal price for visual savings
  
  const cycles = [
    { id: '2_years', months: 24, label: '24 Months', price: plan.price2Year },
    { id: '1_year', months: 12, label: '12 Months', price: plan.price1Year },
    { id: '1_month', months: 1, label: '1 Month', price: plan.priceMonthly }
  ].filter(c => c.price !== null && c.price !== undefined);

  const selectedCycle = cycles.find(c => c.id === billingCycle) || cycles[0];
  const subtotal = selectedCycle.price * selectedCycle.months * quantity;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  // CSS variables for current theme
  const bgMain = isDarkMode ? 'bg-[#0a0a0e]' : 'bg-gray-50';
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-gray-200 shadow-sm';
  const iconBg = isDarkMode ? 'bg-black/40 border-white/10' : 'bg-gray-100 border-gray-200';
  const qtyBtnBg = isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200';
  const cycleCardUnselected = isDarkMode ? 'border-white/5 bg-white/5 hover:border-white/20' : 'border-gray-200 bg-white hover:border-gray-300';
  const cycleCardSelected = isDarkMode 
    ? 'border-[#673de6] bg-gradient-to-br from-[#673de6]/10 to-[#00f0ff]/5 shadow-[0_0_30px_rgba(103,61,230,0.15)]'
    : 'border-[#673de6] bg-[#f8f5ff] shadow-sm';
  const radioOuter = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const radioInner = isDarkMode ? 'bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]' : 'bg-[#673de6]';
  const gradientText = isDarkMode ? 'from-[#00f0ff] to-white' : 'from-[#673de6] to-[#673de6]';
  const totalBorder = isDarkMode ? 'border-white/10' : 'border-gray-200';
  const mainBtnBg = isDarkMode ? 'bg-white hover:bg-gray-100 text-[#0a0a0e]' : 'bg-[#673de6] hover:bg-[#5229c3] text-white';

  return (
    <div className={`min-h-screen ${bgMain} pt-24 pb-20 px-4 relative overflow-hidden transition-colors duration-500`}>
      {/* Background glowing effects (Only in Dark Mode) */}
      <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#673de6] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 ${isDarkMode ? 'opacity-20' : 'opacity-0'}`}></div>
      <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00f0ff] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 ${isDarkMode ? 'opacity-10' : 'opacity-0'}`}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header & Theme Toggle */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 text-center md:text-left gap-6">
          <div>
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${textMain}`}>Setup Your Environment</h1>
            <p className={`text-lg ${textSub}`}>Configure your <span className={isDarkMode ? 'text-[#00f0ff]' : 'text-[#673de6]'}>{plan.name}</span> instance.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Configurations */}
          <div className="flex-1 space-y-8">
            
            {/* Server Quantity Card */}
            <div className={`border rounded-2xl p-6 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${textMain}`}>Server Instances</h3>
                  <p className={`text-sm ${textSub}`}>How many {plan.name} servers do you need?</p>
                </div>
                <div className={`flex items-center gap-4 rounded-xl p-2 border ${iconBg}`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors font-bold text-lg ${qtyBtnBg}`}
                  >
                    -
                  </button>
                  <span className={`font-bold text-xl w-6 text-center ${textMain}`}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#673de6] to-[#00f0ff] hover:opacity-90 text-white shadow-lg transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Cycle Selection */}
            <div>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${textMain}`}>
                <Server className={isDarkMode ? 'text-[#00f0ff]' : 'text-[#673de6]'} size={20} />
                Select Term Length
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {cycles.map((cycle) => {
                  const isSelected = billingCycle === cycle.id;
                  const discountPercent = cycle.months > 1 
                    ? Math.round(((renewalPrice - cycle.price) / renewalPrice) * 100) 
                    : 0;

                  return (
                    <div 
                      key={cycle.id}
                      onClick={() => setBillingCycle(cycle.id as any)}
                      className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 group
                        ${isSelected ? cycleCardSelected : cycleCardUnselected}`}
                    >
                      {discountPercent > 0 && (
                        <div className={`absolute -top-3 -right-3 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg tracking-wider bg-gradient-to-r ${isDarkMode ? 'from-[#00f0ff] to-[#673de6]' : 'from-[#673de6] to-[#8854ff]'}`}>
                          SAVE {discountPercent}%
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isSelected ? (isDarkMode ? 'border-[#00f0ff]' : 'border-[#673de6]') : radioOuter}`}>
                            {isSelected && <div className={`w-3 h-3 rounded-full ${radioInner}`}></div>}
                          </div>
                          <span className={`text-xl font-bold ${isSelected ? textMain : textSub}`}>
                            {cycle.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pl-9">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className={`text-3xl font-black ${isSelected ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600' : textSub} ${isDarkMode && isSelected ? '!text-transparent !bg-gradient-to-r !from-white !to-gray-400' : ''}`}>
                            ₹{cycle.price}
                          </span>
                          <span className={`text-sm font-medium ${textSub}`}>/ mo / server</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className={`text-sm line-through ${isDarkMode ? 'text-gray-500 decoration-gray-600' : 'text-gray-400 decoration-gray-300'}`}>
                            ₹{renewalPrice} / mo / server
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[420px]">
            <div className={`border rounded-3xl p-8 sticky top-24 ${cardBg} ${isDarkMode ? 'shadow-2xl' : 'shadow-lg'}`}>
              <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${textMain}`}>
                <Zap className={isDarkMode ? 'text-[#673de6]' : 'text-[#673de6]'} size={24} />
                Order Summary
              </h3>
              
              <div className="space-y-5 mb-8">
                <div className={`flex justify-between items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium">{plan.name} × {quantity}</span>
                  <span className={`font-semibold ${textMain}`}>₹{subtotal.toLocaleString('en-IN')}.00</span>
                </div>
                <div className={`flex justify-between items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium">Term Length</span>
                  <span className={`font-semibold ${textMain}`}>{selectedCycle.label}</span>
                </div>
                <div className={`flex justify-between items-center border-t pt-5 ${totalBorder} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="font-medium">18% GST</span>
                  <span className={`font-semibold ${textMain}`}>₹{gst.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <div className={`border-t pt-6 mb-8 ${totalBorder}`}>
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-lg font-medium ${textSub}`}>Total Due</span>
                  <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradientText}`}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`text-right text-sm font-medium ${textSub}`}>
                  Renews at ₹{(renewalPrice * selectedCycle.months * quantity).toLocaleString('en-IN')} / {selectedCycle.months} mos
                </div>
              </div>

              <div className="space-y-6">
                <Button 
                  onClick={handleCheckout} 
                  disabled={processing}
                  className={`w-full border-0 h-16 text-lg font-black transition-all hover:scale-[1.02] rounded-xl ${mainBtnBg} ${isDarkMode ? 'shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'shadow-xl shadow-[#673de6]/20'}`}
                >
                  {processing ? <Loader2 className="animate-spin size-6 mx-auto" /> : 'Deploy Infrastructure'}
                </Button>
                
                <div className={`flex items-center justify-center gap-2 text-sm ${textSub}`}>
                  <ShieldCheck className="size-5 text-green-500" />
                  <span>Secure 256-bit AES encrypted checkout</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

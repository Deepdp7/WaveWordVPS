import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const InvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchInvoice = async () => {
      try {
        const res = await apiClient.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        setError('Failed to load invoice details or unauthorized access.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, isAuthenticated, navigate]);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin text-[#673de6] size-8" /></div>;
  if (error || !invoice) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

  const { order } = invoice;
  const { plan, user } = order;

  const handlePrint = () => {
    window.print();
  };

  const gstAmount = Math.round(order.amount - (order.amount / 1.18));
  const baseAmount = order.amount - gstAmount;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      {/* Controls - Hidden during print */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
        <Button className="bg-[#673de6] hover:bg-[#5229c3] text-white" onClick={handlePrint}>
          <Printer className="mr-2 size-4" /> Print / Download PDF
        </Button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-10 print:shadow-none print:border-none print:m-0 print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Wave Word Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Wave Word VPS</h1>
              <p className="text-sm text-gray-500">Premium Hosting Solutions</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-200 uppercase tracking-wider mb-2">Invoice</h2>
            <p className="font-semibold text-gray-800">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wide">
              {order.status === 'paid' ? 'PAID' : order.status}
            </span>
          </div>
        </div>

        {/* Bill To & From */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-gray-600 text-sm">{user.email}</p>
            {user.phone && <p className="text-gray-600 text-sm">{user.phone}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed From</h3>
            <p className="font-semibold text-gray-800">Wave Word</p>
            <p className="text-gray-600 text-sm">waveword015@gmail.com</p>
            <p className="text-gray-600 text-sm">7980975812</p>
          </div>
        </div>

        {/* Invoice Items */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200 text-sm">
              <th className="pb-3 text-gray-600 font-semibold">Description</th>
              <th className="pb-3 text-gray-600 font-semibold text-right">Billing Cycle</th>
              <th className="pb-3 text-gray-600 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4">
                <p className="font-semibold text-gray-800">{plan.name}</p>
                <p className="text-sm text-gray-500">
                  {plan.type === 'vps' 
                    ? `${plan.vcpu} vCPU / ${plan.ramGb}GB RAM / ${plan.storageGb}GB NVMe` 
                    : `${plan.storageGb}GB Storage / ${plan.websiteLimit || 'Unlimited'} Websites`}
                </p>
              </td>
              <td className="py-4 text-right text-gray-600 capitalize">
                {order.billingCycle.replace('_', ' ')}
              </td>
              <td className="py-4 text-right font-medium text-gray-800">
                ₹{baseAmount.toLocaleString('en-IN')}.00
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{baseAmount.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-3">
              <span>Total Paid</span>
              <span>₹{order.amount.toLocaleString('en-IN')}.00</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          <p>Thank you for choosing Wave Word VPS Hosting!</p>
          <p>For support, contact waveword015@gmail.com</p>
        </div>

      </div>

      {/* Print CSS Injection */}
      <style>{`
        @media print {
          body { background: white; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  );
};

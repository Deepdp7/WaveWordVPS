import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

type Language = 'en' | 'bn' | 'hi';

const content = {
  en: {
    title: 'Terms and Conditions',
    subtitle: 'Please read our service terms carefully before proceeding with any purchase.',
    sections: [
      {
        title: '1. Nature of Service',
        body: 'Our current home server infrastructure is primarily tailored for our personal clients and managed hosting solutions. It is built to ensure a controlled and optimized environment.'
      },
      {
        title: '2. SSH Access Limitations',
        body: 'Unlike large-scale commercial providers (e.g., Hostinger), we do not currently offer unrestricted, unmanaged personal VPS instances with full root SSH access. We cannot be held responsible for accommodating requests for traditional, unmanaged SSH access at this time. Please be aware of this limitation before purchasing.'
      },
      {
        title: '3. Future Offerings',
        body: 'We are actively expanding our infrastructure. In the near future, we plan to roll out full, unmanaged personal VPS services where you will have complete administrative control over your instances.'
      },
      {
        title: '4. Custom Projects & Development',
        body: 'If you are purchasing a VPS with the intention of having our team build, deploy, or manage a project for you, please contact us directly at waveword.in so we can discuss your customized requirements.'
      }
    ],
    footer: 'By proceeding with a purchase, you acknowledge that you have read, understood, and agreed to these terms.'
  },
  bn: {
    title: 'শর্তাবলী এবং নিয়মাবলী',
    subtitle: 'যেকোনো সার্ভিস কেনার আগে অনুগ্রহ করে আমাদের শর্তাবলী ভালোভাবে পড়ুন।',
    sections: [
      {
        title: '১. সার্ভিসের ধরন',
        body: 'আমাদের বর্তমান হোম সার্ভার ইনফ্রাস্ট্রাকচারটি মূলত আমাদের নিজস্ব ক্লায়েন্ট এবং ম্যানেজড হোস্টিং সলিউশনের জন্য বিশেষভাবে তৈরি করা হয়েছে, যা একটি সুরক্ষিত এবং অপ্টিমাইজড পরিবেশ নিশ্চিত করে।'
      },
      {
        title: '২. SSH অ্যাক্সেস লিমিটেশন',
        body: 'হোস্টিংগার (Hostinger) বা অন্যান্য বড় প্রোভাইডারের মতো আমরা বর্তমানে আনম্যানেজড বা সম্পূর্ণ পার্সোনাল রুট (Root) SSH অ্যাক্সেস দিচ্ছি না। কেউ যদি ট্রেডিশনাল ভিপিএস-এর মতো ফুল SSH অ্যাক্সেস দাবি করেন, তবে আমরা এর জন্য কোনো দায়ভার নেব না। কেনার আগে বিষয়টি নিশ্চিত হয়ে নিন।'
      },
      {
        title: '৩. ভবিষ্যৎ পরিকল্পনা',
        body: 'আমরা প্রতিনিয়ত আমাদের সিস্টেম উন্নত করছি। ভবিষ্যতে আমরা স্ট্যান্ডার্ড প্রোভাইডারদের মতো সম্পূর্ণ আনম্যানেজড পার্সোনাল ভিপিএস সার্ভিস নিয়ে আসব, যেখানে আপনার সম্পূর্ণ কন্ট্রোল থাকবে।'
      },
      {
        title: '৪. কাস্টম প্রজেক্ট ডেভেলপমেন্ট',
        body: 'আপনি যদি ভিপিএস কিনে আমাদের মাধ্যমে কোনো প্রজেক্ট বা ওয়েবসাইট তৈরি করে নিতে চান, তবে বিস্তারিত আলোচনার জন্য দয়া করে waveword.in -এ যোগাযোগ করুন।'
      }
    ],
    footer: 'আমাদের সার্ভিস ব্যবহার করার মাধ্যমে আপনি নিশ্চিত করছেন যে আপনি এই শর্তাবলী পড়েছেন এবং সম্মত হয়েছেন।'
  },
  hi: {
    title: 'नियम और शर्तें',
    subtitle: 'कृपया कोई भी खरीदारी करने से पहले हमारी सेवा की शर्तों को ध्यान से पढ़ें।',
    sections: [
      {
        title: '1. सेवा की प्रकृति',
        body: 'हमारा वर्तमान होम सर्वर इन्फ्रास्ट्रक्चर मुख्य रूप से हमारे व्यक्तिगत ग्राहकों और प्रबंधित (Managed) होस्टिंग समाधानों के लिए डिज़ाइन किया गया है, ताकि एक सुरक्षित और अनुकूलित वातावरण सुनिश्चित किया जा सके।'
      },
      {
        title: '2. SSH एक्सेस सीमाएं',
        body: 'होस्टिंगर या अन्य बड़े प्रदाताओं की तरह, हम वर्तमान में पूर्ण व्यक्तिगत रूट SSH एक्सेस के साथ अप्रबंधित वीपीएस (Unmanaged VPS) प्रदान नहीं कर रहे हैं। यदि कोई पारंपरिक वीपीएस की तरह पूर्ण SSH एक्सेस की मांग करता है, तो हम इसके लिए जिम्मेदार नहीं होंगे। खरीदारी से पहले कृपया इसे ध्यान में रखें।'
      },
      {
        title: '3. भविष्य की योजनाएं',
        body: 'हम अपने इन्फ्रास्ट्रक्चर का विस्तार कर रहे हैं। भविष्य में हम मानक प्रदाताओं की तरह पूर्ण अप्रबंधित व्यक्तिगत वीपीएस सेवाएं प्रदान करेंगे, जहां आपका अपने सर्वर पर पूरा नियंत्रण होगा।'
      },
      {
        title: '4. कस्टम प्रोजेक्ट और डेवलपमेंट',
        body: 'यदि आप हमारे वीपीएस को खरीदकर हमसे कोई कस्टम प्रोजेक्ट या वेबसाइट बनवाना चाहते हैं, तो कृपया व्यक्तिगत चर्चा के लिए सीधे waveword.in पर संपर्क करें।'
      }
    ],
    footer: 'हमारी सेवाओं को खरीदकर, आप स्वीकार करते हैं कि आपने इन शर्तों को पढ़, समझ और स्वीकार कर लिया है।'
  }
};

export const TermsPage = () => {
  const [lang, setLang] = useState<Language>('en');

  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const t = content[lang];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          <div className="p-8 md:p-12 border-b border-border bg-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="size-8 text-primary" />
                  <h1 className="text-3xl md:text-4xl font-bold text-text">{t.title}</h1>
                </div>
                <p className="text-muted text-lg">{t.subtitle}</p>
              </div>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-lg shadow-sm">
                <Globe className="size-4 text-muted ml-2" />
                {(['en', 'bn', 'hi'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      lang === l 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-muted hover:text-text hover:bg-surface'
                    }`}
                  >
                    {l === 'en' ? 'English' : l === 'bn' ? 'বাংলা' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            {t.sections.map((section, index) => (
              <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-semibold text-text mb-3">{section.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[1.05rem]">
                  {section.body}
                </p>
              </div>
            ))}

            <div className="mt-12 p-6 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-primary font-medium text-center">
                {t.footer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

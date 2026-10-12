import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Tractor,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Heart,
  X,
  Code2,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Footer = () => {
  const { t, language } = useLanguage();

  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
    useEffect(() => {
    if (!isDeveloperOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDeveloperOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDeveloperOpen]);

  return (
    <footer className="bg-emerald-950 text-emerald-100/80 border-t border-emerald-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-emerald-900/80">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-emerald-950">
                <Tractor className="w-6 h-6 fill-emerald-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">{t('brand')}</h3>
                <p className="text-[11px] text-emerald-300">{t('subtitle')}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-emerald-200/70">
              {language === 'te'
                ? 'రైతుల కోసం నాణ్యమైన, అత్యంత వేగవంతమైన ట్రాక్టర్ సేవల వేదిక. నేల దున్నడం నుండి పంటల రవాణా వరకు ఒకే క్లిక్‌తో.'
                : language === 'hi'
                ? 'किसानों के लिए गुणवत्तापूर्ण, विश्वसनीय और त्वरित ट्रैक्टर सेवाओं का मंच। खेत जुताई से लेकर उपज ढुलाई तक।'
                : 'Pioneering agricultural mechanization with instant tractor booking for soil ploughing, seed drilling, and harvest trolley transportation.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {language === 'te' ? 'ముఖ్యమైన లింకులు' : language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-400 transition">{t('nav.home')}</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-400 transition">{t('nav.services')}</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-amber-400 transition">{t('nav.bookNow')}</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">{t('nav.login')} / {t('nav.signup')}</Link>
              </li>
            </ul>
          </div>

          {/* Service Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {language === 'te' ? 'సేవా విభాగాలు' : language === 'hi' ? 'सेवा श्रेणियां' : 'Service Categories'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{t('categories.ploughing')} (₹850 - ₹1,350/Acre)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{t('categories.sowing')} (₹1,000 - ₹1,400/Acre)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span>{t('categories.trolley')} (₹850 - ₹1,250/Trip)</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              {language === 'te' ? 'సంప్రదించండి' : language === 'hi' ? 'संपर्क करें' : 'Contact & Helpline'}
            </h4>
            <div className="space-y-2.5 text-xs text-emerald-200/80">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <a href="tel:+919440727491" className="hover:text-white font-medium">+91 9440727491 (24/7 Kisan Helpline)</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>support@sambatractors.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Samba Tracktors, Muthulurupaddu, Khajipeta, Andhra Pradesh 516203</span>
              </div>
            </div>
          </div>
        </div>

       <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/60">
  <p>
    © {new Date().getFullYear()} {t('brand')} — {t('subtitle')}. All rights reserved.
  </p>

  <p className="flex items-center gap-1">
    <span>Built with precision for Indian Farmers</span>
    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
  </p>

  <button
    type="button"
    onClick={() => setIsDeveloperOpen(true)}
    className="group flex items-center gap-2 rounded-full border border-emerald-700/70 bg-emerald-900/40 px-3 py-2 text-emerald-100 transition-all duration-300 hover:border-amber-400 hover:text-amber-300 hover:shadow-lg hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
    aria-label="Open developer profile"
  >
   <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-amber-400">
  <img
  src="https://i.ibb.co/RTddRmJk/Maheswar-Reddy-website.png"
  alt="Maheswar Reddy - Full Stack Developer"
  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-125"
/>
</span>

    <span className="text-left">
      <span className="block font-bold text-white">
        Maheswar Reddy
      </span>
      <span className="block text-[10px] text-emerald-300">
        Full Stack Developer · View Profile ↗
      </span>
    </span>

    <Sparkles className="h-4 w-4 text-amber-400" />
  </button>
        </div>
      </div>

      {/* Developer Profile 3D Popup */}
      <AnimatePresence>
        {isDeveloperOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsDeveloperOpen(false);
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="developer-profile-title"
              className="relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-red-500/40 bg-slate-950 text-white shadow-2xl shadow-red-950/50"
              initial={{
                opacity: 0,
                y: 60,
                rotateX: -12,
                scale: 0.85
              }}
              animate={{
                opacity: 1,
                y: 0,
                rotateX: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: 30,
                rotateX: 8,
                scale: 0.9
              }}
              transition={{
                type: 'spring',
                stiffness: 160,
                damping: 18
              }}
              style={{ transformPerspective: 1200 }}
            >
              <button
                type="button"
                onClick={() => setIsDeveloperOpen(false)}
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:rotate-90 hover:border-red-400 hover:bg-red-600"
                aria-label="Close developer profile"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Developer Image */}
                <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-red-950 to-black p-6 sm:p-8">
                  <div className="absolute h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />

                  <motion.div
                    className="relative w-full max-w-sm"
                    initial={{ rotateY: -25, rotateX: 8 }}
                    animate={{
                      rotateY: [ -8, 8, -8 ],
                      rotateX: [ 2, -2, 2 ],
                      y: [ 0, -8, 0 ]
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformPerspective: 1000
                    }}
                  >
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-500 via-amber-400 to-red-800 opacity-80 blur-sm" />

                    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl">
                      <img
                      src="https://i.ibb.co/RTddRmJk/Maheswar-Reddy-website.png"
                      alt="Maheswar Reddy - Full Stack Developer"
                       className="block h-auto w-full object-contain"
                      />                   
                    </div>
                  </motion.div>

                  <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-red-400/30 bg-black/60 px-3 py-2 text-xs text-red-200 backdrop-blur">
                    <Code2 className="h-4 w-4" />
                    Building digital experiences
                  </div>
                </div>

                {/* Developer Details */}
                <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                    <Sparkles className="h-4 w-4" />
                    Meet the Developer
                  </p>

                  <h2
                    id="developer-profile-title"
                    className="text-3xl font-black tracking-tight sm:text-4xl"
                  >
                    Maheswar <span className="text-red-500">Reddy</span>
                  </h2>

                  <p className="mt-2 text-lg font-semibold text-amber-300">
                    Full Stack Developer
                  </p>

                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    Passionate about building modern, responsive and
                    user-friendly web applications with clean code and
                    practical solutions.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-400">Education</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        BTech
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-slate-400">Focus</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Web Development
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-200">
                    Technical Skills
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      'HTML',
                      'CSS',
                      'JavaScript',
                      'React',
                      'Node.js',
                      'Express.js',
                      'MongoDB',
                      'SQL'
                    ].map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.15 + index * 0.06
                        }}
                        className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDeveloperOpen(false)}
                    className="mt-8 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-red-900/30 transition hover:scale-[1.02] hover:from-red-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Back to Samba Tractors
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;

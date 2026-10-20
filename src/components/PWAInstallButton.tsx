import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Monitor, Smartphone, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed as standalone app, hide the button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
        return;
      }
    }
    // If browser prompt wasn't triggered or is on iOS/desktop without active prompt, open helpful guided modal
    setShowGuideModal(true);
  };

  return (
    <>
      {/* Prominent Always-Visible Install Button */}
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 border border-emerald-400/30"
        title="স্মার্টফোনে বা কম্পিউটারে এ্যাপটি ইন্সটল করে অফলাইনে ব্যবহার করুন"
      >
        <Download className="w-4 h-4 text-emerald-100 animate-bounce shrink-0" />
        <span className="whitespace-nowrap">এ্যাপ ইন্সটল</span>
      </button>

      {/* Installation Success Toast */}
      {installSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top duration-300">
          <Check className="w-4 h-4" />
          <span>এ্যাপটি সফলভাবে ইন্সটল হয়েছে!</span>
        </div>
      )}

      {/* Guided Install Modal for all devices */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    এ্যাপ ইন্সটল করার নিয়ম
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Install Munsi Supplier Directory (PWA)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-slate-600">
              {isInstallable && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-2">
                    আপনার ব্রাউজার সরাসরি ইন্সটল সমর্থন করে:
                  </p>
                  <button
                    onClick={async () => {
                      const ok = await install();
                      if (ok) setShowGuideModal(false);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>এখনই ইন্সটল করুন</span>
                  </button>
                </div>
              )}

              {/* Instructions based on platform */}
              {isIOS ? (
                /* iOS Instructions */
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>iPhone / iPad এ যেভাবে ইন্সটল করবেন:</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                      ১
                    </span>
                    <p className="leading-relaxed">
                      Safari ব্রাউজারের নিচের টুলবার থেকে <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-blue-500 inline" /> Share</strong> বাটনে চাপ দিন।
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                      ২
                    </span>
                    <p className="leading-relaxed">
                      নিচে স্ক্রোল করে <strong className="text-slate-900 font-semibold inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" /> Add to Home Screen</strong> এ চাপ দিন।
                    </p>
                  </div>
                </div>
              ) : (
                /* Android / Desktop Chrome / Edge Instructions */
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Android মোবাইল অথবা কম্পিউটারে ইন্সটল করার নিয়ম:</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                      ১
                    </span>
                    <p className="leading-relaxed">
                      ব্রাউজারের উপরের ডান কোণায় থাকা <strong>৩-ডট মেন্যু (⋮)</strong> অথবা অ্যাড্রেস বারের ডানপাশের <strong>ইন্সটল আইকন</strong> এ ক্লিক করুন।
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                      ২
                    </span>
                    <p className="leading-relaxed">
                      মেন্যু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> নির্বাচন করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Benefits highlight */}
              <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 border border-slate-100 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  এ্যাপ ইন্সটল করলে সুবিধা:
                </p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>ইন্টারনেট ছাড়াও অফলাইনে সরাসরি চালু করা যাবে</li>
                  <li>মোবাইল হোমস্ক্রিন থেকে ১ ক্লিকে হোয়াটসঅ্যাপ ব্রডকাস্ট পাঠানো যাবে</li>
                  <li>ব্রাউজারের অ্যাড্রেস বার ছাড়া ফুলস্ক্রিন নেটিভ এ্যাপের মতো চলবে</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition"
            >
              ঠিক আছে, বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Building2,
  Cloud,
  CloudOff,
  Database,
  LogIn,
  LogOut,
  WifiOff,
  Layers,
  Users,
  Shield,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  isAuthLoading: boolean;
  isAdmin: boolean;
  supplierCount: number;
  categoryCount: number;
  syncStatus: 'cloud' | 'local' | 'syncing';
  onOpenNewSupplier: () => void;
  onOpenExportImport: () => void;
  onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAuthLoading,
  isAdmin,
  supplierCount,
  categoryCount,
  syncStatus,
  onOpenNewSupplier,
  onOpenExportImport,
  onOpenAdminPanel,
}) => {
  const isOnline = useOnlineStatus();

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Munsi Suppliers
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  PWA
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="truncate max-w-[120px] sm:max-w-none">
                  Project: <strong className="text-slate-700 font-semibold">munsi-chain</strong>
                </span>
                <span className="text-slate-300">•</span>
                {syncStatus === 'cloud' && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Cloud className="w-3 h-3" /> Cloud Synced
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="inline-flex items-center gap-1 text-amber-600 animate-pulse">
                    <Database className="w-3 h-3" /> Syncing...
                  </span>
                )}
                {syncStatus === 'local' && (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <CloudOff className="w-3 h-3" /> Offline / Local
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Stats (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span><strong>{supplierCount}</strong> Suppliers</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span><strong>{categoryCount}</strong> Categories</span>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Offline Alert if disconnected */}
            {!isOnline && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            {/* PWA Install Button (Always visible when not installed) */}
            <PWAInstallButton />

            {/* Admin Panel Trigger */}
            <button
              onClick={onOpenAdminPanel}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl transition shadow-2xs ${
                isAdmin
                  ? 'bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-500/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="এ্যাডমিন প্যানেল: প্রাইস ও সংবেদনশীল তথ্য গোপন বা প্রকাশ করুন"
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className="hidden sm:inline">এ্যাডমিন</span>
            </button>

            {/* Export / Data Backup */}
            <button
              onClick={onOpenExportImport}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Backup, Export CSV/JSON or Restore Data"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data</span>
            </button>

            {/* Add Supplier Quick Button */}
            <button
              onClick={onOpenNewSupplier}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition shrink-0"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span className="hidden sm:inline">সাপ্লায়ার যোগ</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Firebase User Auth */}
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-emerald-500/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition"
                  title="Sign Out from Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition active:scale-95"
                title="Sign in with Google to sync suppliers with Firebase Cloud"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

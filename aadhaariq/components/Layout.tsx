
import React from 'react';
import { Language, AppState } from '../types';
import { translations } from '../translations';
import {
  BarChart3,
  Map as MapIcon,
  Cpu,
  MessageSquare,
  FileText,
  Globe,
  Settings,
  Bell,
  Search,
  ArrowLeftRight,
  Database,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface LayoutProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ state, setState, activeTab, setActiveTab, children }) => {
  const t = translations[state.lang];

  const toggleLang = () => {
    setState(prev => ({ ...prev, lang: prev.lang === 'EN' ? 'HI' : 'EN' }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      selectedState: value === '' ? null : value
    }));
  };

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: t.dashboard },
    { id: 'comparison', icon: ArrowLeftRight, label: t.compareStates },
    { id: 'map', icon: MapIcon, label: t.geoMap },
    { id: 'ml', icon: Cpu, label: t.mlInsights },
    { id: 'predictive', icon: Activity, label: t.predictiveTrends },
    { id: 'ai', icon: MessageSquare, label: t.aiEngine },
    { id: 'reports', icon: FileText, label: t.strategyReports },
  ];

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 glass-panel border-r border-gray-800 hidden md:flex flex-col no-print">
        <div className="p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-orange-500 p-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-blue-500 chakra-spin">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                {[...Array(24)].map((_, i) => (
                  <line
                    key={i}
                    x1="50" y1="50"
                    x2={50 + 40 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={50 + 40 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="currentColor" strokeWidth="1"
                  />
                ))}
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-600 w-4 h-4 rounded-full border-2 border-black" />
          </div>
          <h1 className="text-2xl font-bold devanagari-header text-white tricolor-text bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <nav className="flex-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-4 transition-colors ${activeTab === item.id
                ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500 text-orange-400'
                : 'hover:bg-white/5 text-gray-400'
                }`}
            >
              <item.icon className="w-5 h-5 mr-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 glass-panel border-b border-gray-800 flex items-center justify-between px-4 md:px-8 no-print">
          <div className="flex items-center gap-4">
            {/* Mobile Logo Icon */}
            <div className="md:hidden w-8 h-8 rounded-full border border-orange-500 p-1 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-orange-500 to-green-500" />
            </div>
            <span className="text-xs md:text-sm text-gray-500 hidden sm:block">{t.currentRegion}</span>
            <span className="bg-gray-900 text-orange-400 px-3 py-1 rounded-full text-xs md:text-sm font-bold border border-orange-500/30 min-w-[80px] md:min-w-[100px] text-center">
              {state.selectedState || t.allIndia}
            </span>
          </div>

          <div className="flex-1 max-w-md mx-4 relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder || "Search states..."}
              onChange={handleSearchChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-orange-500 transition-all text-xs font-bold"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              {state.lang === 'EN' ? 'हिंदी' : 'English'}
            </button>
          </div>
        </header>

        {/* Banner Tricolor Strip */}
        <div className="tricolor-gradient no-print" />

        <div className="p-4 md:p-8 pb-24 md:pb-20">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-gray-800 z-50 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === item.id
              ? 'text-orange-400 bg-orange-500/10'
              : 'text-gray-500'}`}
          >
            <item.icon className={`w-5 h-5 mb-1 ${activeTab === item.id ? 'stroke-2' : 'stroke-1'}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;

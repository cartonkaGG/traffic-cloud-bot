import { motion } from 'framer-motion';
import { Home, Layers, Radio, Wallet, Settings } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Головна', icon: Home },
  { id: 'offers', label: 'Офери', icon: Layers },
  { id: 'channels', label: 'Канали', icon: Radio },
  { id: 'payout', label: 'Виплата', icon: Wallet },
];

export default function BottomNav({ active, onChange, isAdmin, onAdmin }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
      <div className="glass rounded-2xl flex items-center justify-around p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3 cursor-pointer min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-accent/20 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-accent' : 'text-muted'}`} />
              <span className={`text-[10px] relative z-10 ${isActive ? 'text-accent font-medium' : 'text-muted'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        {isAdmin && (
          <button
            onClick={onAdmin}
            className="relative flex flex-col items-center gap-0.5 py-2 px-3 cursor-pointer min-w-[60px]"
          >
            <Settings className={`w-5 h-5 ${active === 'admin' ? 'text-primary' : 'text-muted'}`} />
            <span className={`text-[10px] ${active === 'admin' ? 'text-primary font-medium' : 'text-muted'}`}>
              Адмін
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

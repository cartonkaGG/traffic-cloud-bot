import {
  Bitcoin,
  TrendingUp,
  Calendar,
  Trophy,
  Newspaper,
  Dices,
  Music,
  Send,
  Film,
  Play,
  Youtube,
  Instagram,
  Folder,
  Globe,
} from 'lucide-react';

const iconMap = {
  bitcoin: Bitcoin,
  'trending-up': TrendingUp,
  calendar: Calendar,
  trophy: Trophy,
  newspaper: Newspaper,
  dice: Dices,
  music: Music,
  send: Send,
  film: Film,
  play: Play,
  youtube: Youtube,
  instagram: Instagram,
  folder: Folder,
  globe: Globe,
};

export function getIcon(name) {
  return iconMap[name] || Globe;
}

export function IconByName({ name, className = 'w-5 h-5', style }) {
  const Icon = getIcon(name);
  return <Icon className={className} style={style} />;
}

export const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

export function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

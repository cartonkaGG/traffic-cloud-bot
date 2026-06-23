import { motion } from 'framer-motion';
import TrafficCloudMark from './brand/TrafficCloudMark';

export function Card({ children, className = '', onClick, glow }) {
  const Component = onClick ? motion.button : motion.div;
  return (
    <Component
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel relative overflow-hidden p-4 ${onClick ? 'cursor-pointer text-left w-full hover:border-white/[0.14] transition-colors' : ''} ${
        glow ? 'shadow-glow' : ''
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-px rounded-[15px] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent opacity-60"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'vu-cta text-white font-semibold',
    gold: 'vu-cta text-white font-semibold',
    outline:
      'border border-white/[0.10] bg-white/[0.03] text-zinc-200 hover:border-accent/35 hover:bg-white/[0.05]',
    ghost: 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
    danger: 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children, color = '#5ec8ff' }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-white/[0.06]"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <motion.div
      variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
      className="glass-panel group relative overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
          {sub && <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent shadow-inner">
            <Icon className="w-5 h-5" aria-hidden />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl scale-150" />
        <TrafficCloudMark size={56} variant="auth" className="relative" />
      </div>
      <div className="text-center">
        <p className="text-[11px] font-extrabold tracking-[0.22em] text-white">TRAFFIC CLOUD</p>
        <p className="text-xs text-zinc-500 mt-2">Завантаження...</p>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full"
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-500">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="font-semibold text-lg text-white">{title}</h3>
      <p className="text-zinc-500 text-sm mt-2 max-w-xs">{description}</p>
    </motion.div>
  );
}

export function PageTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-1">
      {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-gradient mt-1">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
}

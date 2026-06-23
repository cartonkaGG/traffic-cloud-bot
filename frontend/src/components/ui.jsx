import { motion } from 'framer-motion';

export function Card({ children, className = '', onClick, glow }) {
  const Component = onClick ? motion.button : motion.div;
  return (
    <Component
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`glass rounded-2xl p-4 ${onClick ? 'cursor-pointer text-left w-full' : ''} ${
        glow ? 'shadow-glow' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white shadow-glow',
    gold: 'bg-primary hover:bg-primary/90 text-background font-semibold shadow-glow-gold',
    outline: 'border border-white/20 hover:border-accent/50 hover:bg-white/5',
    ghost: 'hover:bg-white/5',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-3 rounded-xl font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children, color = '#8B5CF6' }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, icon: Icon, color = '#F59E0B' }) {
  return (
    <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }} className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted text-sm">{label}</p>
          <p className="text-2xl font-heading font-bold mt-1" style={{ color }}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}22` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full"
      />
      <p className="text-muted font-heading">Traffic Cloud</p>
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
      {Icon && <Icon className="w-12 h-12 text-muted mb-4" />}
      <h3 className="font-heading font-semibold text-lg">{title}</h3>
      <p className="text-muted text-sm mt-2 max-w-xs">{description}</p>
    </motion.div>
  );
}

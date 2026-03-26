import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/50 px-8 py-3 backdrop-blur-md">
        <Link to="/" className="text-xl font-black tracking-tighter text-white">
          ACADIA<span className="text-neon">.</span>
        </Link>
        <nav className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          {[
            ['Dashboard', '/dashboard'],
            ['Subjects', '/subjects'],
            ['Tasks', '/tasks'],
            ['Availability', '/availability'],
            ['Plan', '/plan'],
            ['Profile', '/profile'],
          ].map(([label, href]) => (
            <Link 
              key={href} 
              to={href} 
              className={`relative py-1 transition-colors ${location.pathname === href ? 'text-neon' : 'text-muted hover:text-white'}`}
            >
              {label}
              {location.pathname === href && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon"
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
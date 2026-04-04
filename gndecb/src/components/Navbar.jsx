import { motion, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  // Show navbar when scrolled past hero (approx 100vh)
  useEffect(() => {
    return scrollY.onChange((latest) => {
      if (latest > window.innerHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });
  }, [scrollY]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-full border border-gray-700" />
          <span className="font-serif font-bold text-xl text-white tracking-[0.2em] hidden sm:block">GNDECB</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-xs font-semibold tracking-[0.25em] text-gray-300">
          <a href="#about" className="hover:text-accent-gold transition-colors duration-300">ABOUT</a>
          <a href="#departments" className="hover:text-accent-gold transition-colors duration-300">DEPARTMENTS</a>
          <a href="#projects" className="hover:text-accent-gold transition-colors duration-300">PROJECTS</a>
          <a href="#achievements" className="hover:text-accent-gold transition-colors duration-300">ACHIEVEMENTS</a>
          <a href="#contact" className="hover:text-accent-gold transition-colors duration-300">CONTACT</a>
        </div>
        
        <button className="md:hidden text-white hover:text-accent-gold transition-colors cursor-pointer">
          <Menu className="w-7 h-7" />
        </button>
      </div>
    </motion.nav>
  );
}

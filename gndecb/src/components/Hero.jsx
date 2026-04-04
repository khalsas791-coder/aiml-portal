import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Hero() {
  const { scrollY } = useScroll();
  
  // Smooth out the scroll value for Apple-style buttery tracking
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  // Background parallax (moves slower than scroll)
  const bgY = useTransform(smoothScrollY, [0, 1000], [0, 200]);

  // Logo transformations based on scroll position (0 to 600px)
  const logoScale = useTransform(smoothScrollY, [0, 600], [1.5, 1]);
  const logoY = useTransform(smoothScrollY, [0, 600], [0, -60]);
  const logoGlow = useTransform(smoothScrollY, [0, 600], ['0px 0px 0px rgba(59,130,246,0)', '0px 0px 80px rgba(59,130,246,0.3)']);
  
  // Text transformations (fades in slowly without lateral movement, slight upward)
  const textOpacity = useTransform(smoothScrollY, [300, 600], [0, 1]);
  const textY = useTransform(smoothScrollY, [300, 600], [40, 0]);

  // Scroll indicator fade out
  const indicatorOpacity = useTransform(smoothScrollY, [0, 200], [1, 0]);

  return (
    <section className="relative h-[150vh] w-full bg-black overflow-hidden pointer-events-none">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-auto">
        
        {/* Parallax Background */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black to-black"
          style={{ y: bgY }}
        />

        <motion.div 
          className="relative z-10 flex flex-col items-center"
          style={{ y: logoY }}
        >
          <motion.img 
            src="/logo.png" 
            alt="GNDECB Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-full"
            style={{ 
              scale: logoScale,
              boxShadow: logoGlow,
            }}
          />
          
          <motion.div 
            className="mt-12 text-center flex flex-col items-center justify-center"
            style={{ opacity: textOpacity, y: textY }}
          >
            <h1 className="text-4xl md:text-7xl font-bold font-serif text-white mb-4 drop-shadow-2xl tracking-wide">
              GNDECB
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 font-light tracking-[0.2em] uppercase">
              Guru Nanak Dev Engineering College
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-500"
          style={{ opacity: indicatorOpacity }}
        >
          <span className="text-xs uppercase tracking-[0.4em] font-medium mb-4">Scroll Down</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-5 h-8 border border-gray-700 rounded-full flex justify-center p-1"
          >
            <motion.div className="w-1 h-1.5 bg-gray-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

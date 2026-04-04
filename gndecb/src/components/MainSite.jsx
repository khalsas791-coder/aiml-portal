import { motion } from 'framer-motion';

export default function MainSite() {
  return (
    <div className="bg-[#030712] text-white relative z-10 w-full overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50 z-0"></div>

      <Section id="about" title="Our Legacy" subtitle="About College" color="text-white">
        <p className="max-w-4xl text-lg md:text-2xl text-gray-400 font-light leading-relaxed mx-auto text-center">
          Guru Nanak Dev Engineering College, Bidar is a premier technical institution committed to nurturing the next generation of engineering leaders. We blend academic rigor with cutting-edge technical innovation and deep-rooted moral values to build the future of technology.
        </p>
      </Section>
      
      <Section id="departments" title="Centers of Excellence" subtitle="Departments" color="text-accent-gold" dark>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { name: 'Artificial Intelligence & Machine Learning', icon: '🧠', desc: 'Focusing on Deep Learning, NLP, and Autonomous Systems.' },
            { name: 'Computer Science & Engineering', icon: '💻', desc: 'Core software engineering, algorithms, and full-stack development.' },
            { name: 'Information Science', icon: '📊', desc: 'Data Analytics, Cloud Computing, and Cybersecurity frameworks.' }
          ].map((dept, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className="p-10 rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-gray-800 hover:border-accent-gold/40 hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] transition-all duration-500 cursor-pointer"
            >
              <div className="text-4xl mb-6">{dept.icon}</div>
              <h3 className="text-2xl font-bold font-serif mb-4 leading-snug">{dept.name}</h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed">{dept.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="projects" title="Innovation Lab" subtitle="Projects Showcase" color="text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {[
            { title: "Autonomous Ground Vehicle", tag: "AI RESEARCH", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800", color: "from-blue-600/60" },
            { title: "Smart City Traffic Prediction", tag: "DATA SCIENCE", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800", color: "from-purple-600/60" }
          ].map((proj, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02 }}
              className="h-80 md:h-96 rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden relative group cursor-pointer shadow-2xl"
            >
              <img src={proj.img} alt={proj.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              <div className={`absolute inset-0 bg-gradient-to-tr ${proj.color} to-transparent opacity-60`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-xs font-bold text-accent-gold tracking-[0.2em] mb-2 block">{proj.tag}</span>
                <h3 className="text-3xl font-bold font-serif">{proj.title}</h3>
                <div className="h-[2px] w-0 bg-white group-hover:w-16 transition-all duration-500 mt-4"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="achievements" title="Hall of Fame" subtitle="Achievements" color="text-white" dark>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto text-center">
          {[
            { num: "50+", label: "Research Papers" },
            { num: "12", label: "Patents Filed" },
            { num: "96%", label: "Placement Rate" },
            { num: "25+", label: "Industry Partners" }
          ].map((stat, i) => (
            <div key={i} className="p-8">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500 mb-2 font-serif"
              >
                {stat.num}
              </motion.div>
              <div className="text-accent-gold text-sm tracking-widest font-semibold uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <footer id="contact" className="py-20 border-t border-gray-900/50 bg-black relative z-10 text-center">
        <div className="flex flex-col justify-center items-center gap-6 mb-10">
          <img src="/logo.png" className="w-16 h-16 object-contain" />
          <h2 className="text-2xl font-serif text-white tracking-widest">GNDECB</h2>
        </div>
        <div className="flex justify-center gap-8 mb-12 text-sm font-medium tracking-widest text-gray-500">
          <a href="#" className="hover:text-accent-gold transition-colors">ADMISSIONS</a>
          <a href="#" className="hover:text-accent-gold transition-colors">CAMPUS</a>
          <a href="#" className="hover:text-accent-gold transition-colors">ALUMNI</a>
          <a href="#" className="hover:text-accent-gold transition-colors">CAREERS</a>
        </div>
        <p className="text-gray-700 text-xs tracking-[0.2em] uppercase">© 2026 Guru Nanak Dev Engineering College Bidar. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

function Section({ id, title, subtitle, children, dark, color }) {
  const smoothEase = [0.16, 1, 0.3, 1]; // Apple spring curve

  return (
    <section id={id} className={`py-32 px-6 ${dark ? 'bg-[#000000]' : 'bg-transparent'} relative`}>
      {/* Seamless Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#030712] to-transparent pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ margin: "-50px" }}
        transition={{ duration: 1.2, ease: smoothEase }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center mb-20">
          <span className="text-accent-gold text-xs font-semibold tracking-[0.4em] uppercase mb-4 block">{subtitle}</span>
          <h2 className={`text-4xl md:text-6xl font-serif font-bold ${color}`}>{title}</h2>
        </div>
        {children}
      </motion.div>
    </section>
  );
}

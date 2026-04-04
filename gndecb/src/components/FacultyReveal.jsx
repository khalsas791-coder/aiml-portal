import { motion } from 'framer-motion';

const facultyData = [
  { id: 1, name: "Dr. XYZ Singh", title: "Director", image: "/faculty-1.png", delay: 0 },
  { id: 2, name: "Dr. ABC Kaur", title: "Dean Academics", image: "/faculty-2.png", delay: 0.15 },
  { id: 3, name: "Prof. PQR Sharma", title: "HOD AI/ML", image: "/faculty-3.png", delay: 0.3 },
  { id: 4, name: "Dr. LMN Singh", title: "Senior Professor", image: "/faculty-4.png", delay: 0.45 },
];

// Apple-style smooth easing curve
const smoothEase = [0.16, 1, 0.3, 1];

export default function FacultyReveal() {
  return (
    <section className="relative min-h-screen bg-black py-32 px-6 md:px-12 overflow-hidden flex flex-col justify-center border-t border-black">
      {/* Background with slight fade from hero */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent z-10" />
      
      {/* Cinematic Blur Background Parallax */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-blue-900/10 blur-[120px] z-0 rounded-full pointer-events-none" />
      
      <div className="relative z-20 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: smoothEase }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 tracking-wide">Visionary Leadership</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {facultyData.map((faculty) => (
            <motion.div
              key={faculty.id}
              initial={{ opacity: 0, y: 60, scale: 1.1 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 1.2, 
                delay: faculty.delay, 
                ease: smoothEase 
              }}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-black shadow-2xl"
            >
              <div className="aspect-[3/4] w-full bg-[#050505] overflow-hidden">
                <img 
                  src={faculty.image} 
                  alt={faculty.name}
                  className="w-full h-full object-cover object-top transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
                />
              </div>
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8">
                <motion.h3 
                  initial={{ y: 15, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: faculty.delay + 0.3, ease: smoothEase }}
                  className="text-xl md:text-2xl font-bold font-serif text-white mb-1"
                >
                  {faculty.name}
                </motion.h3>
                <motion.p 
                  initial={{ y: 15, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: faculty.delay + 0.4, ease: smoothEase }}
                  className="text-gray-300 font-medium tracking-wide text-sm"
                >
                  {faculty.title}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

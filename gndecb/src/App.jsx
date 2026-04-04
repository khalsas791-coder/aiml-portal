import Hero from './components/Hero';
import FacultyReveal from './components/FacultyReveal';
import Navbar from './components/Navbar';
import AimlVanilla from './components/AimlVanilla';

function App() {
  return (
    <main className="bg-black min-h-screen text-white selection:bg-accent-gold selection:text-black font-sans">
      <Navbar />
      <Hero />
      <FacultyReveal />
      <div className="relative z-10">
        {/* Smooth fade transition background layer between Faculty Reveal and Vanilla AIML Site */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black to-[#020817] z-20 pointer-events-none -translate-y-full"></div>
        <AimlVanilla />
      </div>
    </main>
  );
}

export default App;

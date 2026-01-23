import './index.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Highlights } from './components/Highlights';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Highlights />
        <Projects />
        <Skills />
      </main>
      <Footer />
    </div>
  );
}

export default App;

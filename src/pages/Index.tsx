
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Packages from '@/components/Packages';
import Gallery from '@/components/Gallery';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  console.log('Index component rendering');
  
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Packages />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;

import Navbar from '../../components/Navbar/Navbar';
import Hero from './Hero/Hero';
import Features from './Features/Features';
import Services from './Services/Services';
import Community from './Community/Community';
import Footer from '../../components/Footer/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features/>
      <Services />
      <Community/>
      <Footer/>
    </>
  );
}
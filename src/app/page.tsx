import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { Security } from '@/components/home/security';
import { TrustBar } from '@/components/home/trust-bar';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Security />
      </main>

      <Footer />
    </>
  );
}

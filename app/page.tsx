import LandingPage from './components/LandingPage';

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="noise-overlay"></div>
      <LandingPage />
    </main>
  );
}

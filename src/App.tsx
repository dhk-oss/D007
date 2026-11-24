import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { WardrobePage } from './pages/WardrobePage';
import { ProfilesPage } from './pages/ProfilesPage';
import { LookbookPage } from './pages/LookbookPage';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="w-full max-w-[480px] min-h-screen bg-pastel-cream shadow-2xl relative flex flex-col border-x border-[#EAE2F3]">
      {/* Top Header */}
      <Header />

      {/* Main Tab Content */}
      <main className="flex-1 pb-24 safe-top">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'wardrobe' && <WardrobePage />}
        {activeTab === 'profiles' && <ProfilesPage />}
        {activeTab === 'lookbook' && <LookbookPage />}
      </main>

      {/* Floating / Sticky Mobile Navigation */}
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;

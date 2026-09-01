import { useState } from 'react';
import { Navbar } from './navbar/Navbar';
import { Sidebar } from './sidebar/Sidebar';
import { ComponentShowcase } from './components/showcase/ComponentShowcase';
import { HomePage } from './pages/home/HomePage';
import { NotificationProvider } from './context/NotificationContext';
import { AppleIslandNotification } from './components/ui/apple_island/AppleIslandNotification';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'components'>('home');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('frost-vault');

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
    setCurrentPage('components');
  };

  return (
    <NotificationProvider>
      <div className="app-layout">
        {/* Background ambient lighting */}
        <div className="bg-spotlight" />
        <div className="bg-grid-mesh" />

        {/* Top Navbar */}
        <Navbar onNavigate={(page) => setCurrentPage(page)} />

        {/* Apple Dynamic Island Notification Pill right under Navbar */}
        <AppleIslandNotification />

        {/* Left Sidebar navigation */}
        <Sidebar
          onSelectComponent={handleSelectComponent}
          selectedComponentId={selectedComponentId}
        />

        {/* Main Content View */}
        {currentPage === 'home' ? (
          <HomePage />
        ) : (
          <ComponentShowcase componentId={selectedComponentId} />
        )}
      </div>
    </NotificationProvider>
  );
}

export default App;

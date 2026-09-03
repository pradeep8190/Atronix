import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Navbar } from './navbar/Navbar';
import { Sidebar } from './sidebar/Sidebar';
import { NotificationProvider } from './context/NotificationContext';
import { AppleIslandNotification } from './components/ui/apple_island/AppleIslandNotification';
import componentsRegistry from './data/componentsRegistry';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const HomePage = lazy(() => import('./pages/home/HomePage'));
const ComponentShowcase = lazy(() => import('./components/showcase/ComponentShowcase'));
const AppShowcase = lazy(() => import('./components/showcase/templates/AppShowcase'));

// Parse route from URL pathname, supporting /components/:id and /templates/:id
interface RouteState {
  page: 'home' | 'components' | 'templates';
  componentId: string;
  templateId: string;
}

const parseRouteFromUrl = (): RouteState => {
  if (typeof window === 'undefined') {
    return { page: 'home', componentId: 'frost-vault', templateId: 'jarvis-website' };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname.startsWith('/templates')) {
    const parts = pathname.split('/').filter(Boolean);
    const templateId = parts.length > 1 ? parts[1].toLowerCase().replace(/_/g, '-') : 'jarvis-website';
    return { page: 'templates', componentId: 'frost-vault', templateId };
  }

  if (pathname.startsWith('/components')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      const rawId = parts[1].toLowerCase().replace(/_/g, '-');
      const validId = componentsRegistry[rawId] ? rawId : 'frost-vault';
      return { page: 'components', componentId: validId, templateId: 'jarvis-website' };
    }
    return { page: 'components', componentId: 'frost-vault', templateId: 'jarvis-website' };
  }

  return { page: 'home', componentId: 'frost-vault', templateId: 'jarvis-website' };
};

function App() {
  const [route, setRoute] = useState<RouteState>(parseRouteFromUrl);

  const currentPage = route.page;
  const selectedComponentId = route.componentId;
  const selectedTemplateId = route.templateId;

  // Canonicalize URL on initial mount
  useEffect(() => {
    const currentRoute = parseRouteFromUrl();
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    if (currentRoute.page === 'components') {
      const canonicalPath = `/components/${currentRoute.componentId}`;
      if (pathname !== canonicalPath) {
        window.history.replaceState(currentRoute, '', canonicalPath);
      }
    } else if (currentRoute.page === 'templates') {
      const canonicalPath = `/templates/${currentRoute.templateId}`;
      if (pathname !== canonicalPath) {
        window.history.replaceState(currentRoute, '', canonicalPath);
      }
    }
  }, []);

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRouteFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Global Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Universal Dynamic Document Title
  useEffect(() => {
    if (currentPage === 'home') {
      document.title = 'Atronix UI — Physical Realism for the Modern Web';
    } else if (currentPage === 'templates') {
      document.title = 'Horizon — Jarvis AI — Atronix Showcase';
    } else {
      const comp = componentsRegistry[selectedComponentId];
      const compName = comp ? comp.name : 'Component';
      document.title = `${compName} — Atronix UI`;
    }
  }, [currentPage, selectedComponentId, selectedTemplateId]);

  const handleSelectComponent = useCallback((componentId: string) => {
    const normalizedId = componentId.toLowerCase().replace(/_/g, '-');
    const validId = componentsRegistry[normalizedId] ? normalizedId : 'frost-vault';
    const targetPath = `/components/${validId}`;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: 'components', componentId: validId, templateId: selectedTemplateId }, '', targetPath);
    }
    setRoute((prev) => ({ ...prev, page: 'components', componentId: validId }));
  }, [selectedTemplateId]);

  const handleSelectTemplate = useCallback((templateId: string) => {
    const targetPath = `/templates/${templateId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: 'templates', componentId: selectedComponentId, templateId }, '', targetPath);
    }
    setRoute((prev) => ({ ...prev, page: 'templates', templateId }));
  }, [selectedComponentId]);

  const handleNavigate = useCallback(
    (page: 'home' | 'components') => {
      if (page === 'home') {
        const targetPath = window.location.pathname === '/' ? '/' : '/home';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ page: 'home', componentId: selectedComponentId, templateId: selectedTemplateId }, '', targetPath);
        }
        setRoute((prev) => ({ ...prev, page: 'home' }));
      } else {
        const targetPath = `/components/${selectedComponentId}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState(
            { page: 'components', componentId: selectedComponentId, templateId: selectedTemplateId },
            '',
            targetPath
          );
        }
        setRoute((prev) => ({ ...prev, page: 'components', componentId: selectedComponentId }));
      }
    },
    [selectedComponentId, selectedTemplateId]
  );

  return (
    <NotificationProvider>
      <div className="app-layout">
        {/* Background ambient lighting */}
        <div className="bg-spotlight" />
        <div className="bg-grid-mesh" />

        {/* Top Navbar */}
        <Navbar onNavigate={handleNavigate} />

        {/* Apple Dynamic Island Notification Pill right under Navbar */}
        <AppleIslandNotification />

        {/* Left Sidebar navigation */}
        <Sidebar
          onSelectComponent={handleSelectComponent}
          selectedComponentId={selectedComponentId}
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
        />

        {/* Main Content View with Zero-Load Dynamic Code Splitting */}
        <Suspense
          fallback={
            <main className="page-transition-fallback" style={{ minHeight: '80vh' }} />
          }
        >
          {currentPage === 'home' ? (
            <HomePage onNavigateToComponents={handleSelectComponent} />
          ) : currentPage === 'templates' ? (
            <AppShowcase onBackToComponents={() => handleSelectComponent('frost-vault')} />
          ) : (
            <ComponentShowcase componentId={selectedComponentId} />
          )}
        </Suspense>
      </div>
    </NotificationProvider>
  );
}

export default App;

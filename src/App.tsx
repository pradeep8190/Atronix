import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Navbar } from './navbar/Navbar';
import { Sidebar } from './sidebar/Sidebar';
import { NotificationProvider } from './context/NotificationContext';
import { AppleIslandNotification } from './components/notification/AppleIslandNotification';
import componentsRegistry from './data/componentsRegistry';
import templatesRegistry from './data/templatesRegistry';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const HomePage = lazy(() => import('./pages/home/HomePage'));
const ComponentShowcase = lazy(() => import('./components/showcase/ComponentShowcase'));
const TemplateShowcase = lazy(() => import('./components/showcase/TemplateShowcase'));

// Parse route from URL pathname, supporting /components/:id and /templates/:id
interface RouteState {
  page: 'home' | 'components' | 'templates';
  componentId: string;
  templateId?: string;
}

const parseRouteFromUrl = (): RouteState => {
  if (typeof window === 'undefined') {
    return { page: 'home', componentId: 'frost-vault', templateId: 'testimonials' };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname.startsWith('/templates')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      const rawId = parts[1].toLowerCase().replace(/_/g, '-');
      const validId = templatesRegistry[rawId] ? rawId : 'testimonials';
      return { page: 'templates', componentId: 'frost-vault', templateId: validId };
    }
    return { page: 'templates', componentId: 'frost-vault', templateId: 'testimonials' };
  }

  if (pathname.startsWith('/components')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      const rawId = parts[1].toLowerCase().replace(/_/g, '-');
      const validId = componentsRegistry[rawId] ? rawId : 'frost-vault';
      return { page: 'components', componentId: validId, templateId: 'testimonials' };
    }
    return { page: 'components', componentId: 'frost-vault', templateId: 'testimonials' };
  }

  return { page: 'home', componentId: 'frost-vault', templateId: 'testimonials' };
};

function App() {
  const [route, setRoute] = useState<RouteState>(parseRouteFromUrl);

  const currentPage = route.page;
  const selectedComponentId = route.componentId;
  const selectedTemplateId = route.templateId || 'testimonials';

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
      const canonicalPath = `/templates/${currentRoute.templateId || 'testimonials'}`;
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
      prevent: (node) => {
        return (
          node instanceof HTMLElement &&
          (Boolean(node.closest('.sidebar-container')) ||
            Boolean(node.closest('.code-container.is-expanded')))
        );
      },
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
      const tmpl = templatesRegistry[selectedTemplateId];
      const tmplName = tmpl ? tmpl.name : 'Template';
      document.title = `${tmplName} — Atronix Templates`;
    } else {
      const comp = componentsRegistry[selectedComponentId];
      const compName = comp ? comp.name : 'Component';
      document.title = `${compName} — Atronix UI`;
    }
  }, [currentPage, selectedComponentId, selectedTemplateId]);

  const handleSelectComponent = useCallback((componentId?: string) => {
    const rawId = componentId || 'frost-vault';
    const normalizedId = rawId.toLowerCase().replace(/_/g, '-');
    const validId = componentsRegistry[normalizedId] ? normalizedId : 'frost-vault';
    const targetPath = `/components/${validId}`;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: 'components', componentId: validId }, '', targetPath);
    }
    setRoute((prev) => ({ ...prev, page: 'components', componentId: validId }));
  }, []);

  const handleSelectTemplate = useCallback((templateId?: string) => {
    const rawId = templateId || 'testimonials';
    const normalizedId = rawId.toLowerCase().replace(/_/g, '-');
    const validId = templatesRegistry[normalizedId] ? normalizedId : 'testimonials';
    const targetPath = `/templates/${validId}`;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: 'templates', templateId: validId }, '', targetPath);
    }
    setRoute((prev) => ({ ...prev, page: 'templates', templateId: validId }));
  }, []);

  const handleNavigate = useCallback(
    (page: 'home' | 'components' | 'templates') => {
      if (page === 'home') {
        const targetPath = window.location.pathname === '/' ? '/' : '/home';
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ page: 'home' }, '', targetPath);
        }
        setRoute((prev) => ({ ...prev, page: 'home' }));
      } else if (page === 'templates') {
        const tId = route.templateId || 'testimonials';
        const targetPath = `/templates/${tId}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ page: 'templates', templateId: tId }, '', targetPath);
        }
        setRoute((prev) => ({ ...prev, page: 'templates', templateId: tId }));
      } else {
        const targetPath = `/components/${selectedComponentId}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState(
            { page: 'components', componentId: selectedComponentId },
            '',
            targetPath
          );
        }
        setRoute((prev) => ({ ...prev, page: 'components', componentId: selectedComponentId }));
      }
    },
    [selectedComponentId, route.templateId]
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
          activeSection={currentPage === 'templates' ? 'templates' : 'components'}
        />

        {/* Main Content View with Zero-Load Dynamic Code Splitting */}
        <Suspense
          fallback={
            <main className="page-transition-fallback" style={{ minHeight: '80vh' }} />
          }
        >
          {currentPage === 'home' ? (
            <HomePage
              onNavigateToComponents={handleSelectComponent}
              onNavigateToTemplates={handleSelectTemplate}
            />
          ) : currentPage === 'templates' ? (
            <TemplateShowcase templateId={selectedTemplateId} />
          ) : (
            <ComponentShowcase componentId={selectedComponentId} />
          )}
        </Suspense>
      </div>
    </NotificationProvider>
  );
}

export default App;

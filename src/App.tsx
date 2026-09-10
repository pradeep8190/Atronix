import { useState, useEffect, useCallback, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './navbar/Navbar';
import { Sidebar } from './sidebar/Sidebar';
import { MobileDrawerLayout } from './components/mobile/MobileDrawerLayout';
import { NotificationProvider } from './context/NotificationContext';
import { AppleIslandNotification } from './components/notification/AppleIslandNotification';
import { CommandPalette } from './components/search';
import componentsRegistry from './data/componentsRegistry';
import templatesRegistry from './data/templatesRegistry';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import HomePage from './pages/home/HomePage';
import ComponentShowcase from './components/showcase/ComponentShowcase';
import TemplateShowcase from './components/showcase/TemplateShowcase';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  // Initialize Global Lenis Smooth Scroll (Desktop Only)
  useEffect(() => {
    // Disable Lenis on touch/mobile to preserve native 120Hz iOS ProMotion scrolling & gestures
    if (
      typeof window !== 'undefined' &&
      (window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches)
    ) {
      return;
    }

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
            Boolean(node.closest('.mobile-drawer-plane')) ||
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
    setIsMobileDrawerOpen(false);
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
    setIsMobileDrawerOpen(false);
  }, []);

  const handleNavigate = useCallback(
    (page: 'home' | 'components' | 'templates') => {
      setIsMobileDrawerOpen(false);
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

        {/* World-Class Command Palette / Search Engine Modal */}
        <CommandPalette
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectComponent={handleSelectComponent}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Desktop Fixed Left Sidebar (hidden on mobile via CSS) */}
        <Sidebar
          onSelectComponent={handleSelectComponent}
          selectedComponentId={selectedComponentId}
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
          activeSection={currentPage === 'templates' ? 'templates' : 'components'}
        />

        {/* Sovereign 3D Scale & Slide Mobile Drawer Architecture */}
        <MobileDrawerLayout
          isOpen={isMobileDrawerOpen}
          onOpen={() => setIsMobileDrawerOpen(true)}
          onClose={() => setIsMobileDrawerOpen(false)}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentPage={currentPage}
          headerContent={
            <>
              {/* Top Navbar */}
              <Navbar
                onNavigate={handleNavigate}
                onOpenSearch={() => setIsSearchOpen(true)}
                onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
                isDrawerOpen={isMobileDrawerOpen}
              />

              {/* Apple Dynamic Island Notification Pill right under Navbar */}
              <AppleIslandNotification />
            </>
          }
          sidebarContent={
            <Sidebar
              className="is-mobile-drawer"
              onSelectComponent={(id) => {
                handleSelectComponent(id);
                setIsMobileDrawerOpen(false);
              }}
              selectedComponentId={selectedComponentId}
              onSelectTemplate={(id) => {
                handleSelectTemplate(id);
                setIsMobileDrawerOpen(false);
              }}
              selectedTemplateId={selectedTemplateId}
              activeSection={currentPage === 'templates' ? 'templates' : 'components'}
              onItemClick={() => setIsMobileDrawerOpen(false)}
            />
          }
        >
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
        </MobileDrawerLayout>

        <Analytics />
      </div>
    </NotificationProvider>
  );
}

export default App;


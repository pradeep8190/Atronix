import React from 'react';
import './HomePage.css';
import { HomeHeader } from './HomeHeader';
import { ProjectGrid } from './ProjectGrid';
import { HomeFooter } from './HomeFooter';

interface HomePageProps {
  onNavigateToComponents?: (id?: string) => void;
  onNavigateToTemplates?: (id?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToComponents, onNavigateToTemplates }) => {
  return (
    <main className="home-page-container">
      {/* 1. Hero Header Section (Heading, Subheader, Action Buttons) */}
      <HomeHeader onExplore={() => onNavigateToComponents?.('frost-vault')} />

      {/* 2. Center Section (Divider & 3-Column Project Grid) */}
      <ProjectGrid
        onSelectComponent={onNavigateToComponents}
        onSelectTemplate={onNavigateToTemplates}
      />

      {/* 3. Ending / Footer Section (Divider, Copy, Action Chips, Brand Bar) */}
      <HomeFooter onExplore={() => onNavigateToComponents?.('frost-vault')} />
    </main>
  );
};

export default HomePage;

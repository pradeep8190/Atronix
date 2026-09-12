import React from 'react';
import './HomePage.css';
import { HomeHeader } from './HomeHeader';
import { ProjectGrid } from './ProjectGrid';
import { HomeDNA } from './HomeDNA';
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

      {/* 2. Top 3 Flagship Masterpieces (Single Row, Completes ~100vh First Impression) */}
      <ProjectGrid
        onSelectComponent={onNavigateToComponents}
        onSelectTemplate={onNavigateToTemplates}
      />

      {/* 3. The DNA of Atronix Section (Card-Free Pure CSS Physical Laws) */}
      <HomeDNA onExplore={() => onNavigateToComponents?.('frost-vault')} />

      {/* 4. Ending / Footer Section (Divider, Copy, Action Chips, Brand Bar) */}
      <HomeFooter onExplore={() => onNavigateToComponents?.('frost-vault')} />
    </main>
  );
};

export default HomePage;

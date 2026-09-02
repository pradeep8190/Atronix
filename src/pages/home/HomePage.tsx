import React from 'react';
import './HomePage.css';
import { HomeHeader } from './HomeHeader';
import { ProjectGrid } from './ProjectGrid';
import { HomeFooter } from './HomeFooter';

export const HomePage: React.FC = () => {
  return (
    <main className="home-page-container">
      {/* 1. Hero Header Section (Heading, Subheader, Action Buttons) */}
      <HomeHeader />

      {/* 2. Center Section (Divider & 3-Column Project Grid) */}
      <ProjectGrid />

      {/* 3. Ending / Footer Section (Divider, Copy, Action Chips, Brand Bar) */}
      <HomeFooter />
    </main>
  );
};

export default HomePage;

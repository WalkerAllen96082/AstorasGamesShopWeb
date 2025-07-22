import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const Layout: React.FC<LayoutProps> = ({ children, maxWidth = 'xl' }) => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth={maxWidth}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
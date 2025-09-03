import React from 'react';
import {
  Box,
  IconButton,
  Grid,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { ProductCard } from './ProductCard';
import { Game, Product, Service } from '../types';

interface UniversalCarouselProps {
  title: string;
  items: (Game | Product | Service)[];
  type: 'game' | 'product' | 'service';
  loading: boolean;
}

export const UniversalCarousel: React.FC<UniversalCarouselProps> = ({ title, items, type, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const itemsPerPage = isMobile ? 3 : 5;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const currentItems = items.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  const gridItemSize = isMobile ? { xs: 4, sm: 4, md: 4 } : { xs: 12, sm: 6, md: 12 / 5, lg: 12 / 5, xl: 12 / 5 };

  return (
    <Paper sx={{ p: 3, mb: 4, position: 'relative' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      {items.length > itemsPerPage && (
        <>
          <IconButton
            onClick={handlePrevious}
            color="primary"
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            color="primary"
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      <Grid container spacing={1}>
        {loading
          ? Array.from({ length: itemsPerPage }, (_, index) => (
              <Grid item {...gridItemSize} key={index}>
                <Box>
                  <Box sx={{ height: 280, backgroundColor: 'grey.300', mb: 1, borderRadius: 1 }} />
                  <Box sx={{ height: 30, backgroundColor: 'grey.300', mb: 1, borderRadius: 1 }} />
                  <Box sx={{ height: 20, backgroundColor: 'grey.300', width: '60%', borderRadius: 1 }} />
                </Box>
              </Grid>
            ))
          : currentItems.map((item) => (
              <Grid item {...gridItemSize} key={item.id}>
                <ProductCard item={item} type={type} compact={isMobile} />
              </Grid>
            ))}
      </Grid>

      {!loading && items.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No se encontraron elementos en esta categoría aún.
        </Typography>
      )}
    </Paper>
  );
};

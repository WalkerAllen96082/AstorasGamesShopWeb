import React from 'react';
import {
  Box,
  IconButton,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { ProductCard } from './ProductCard';
import { Game } from '../types';

interface GameCarouselProps {
  title: string;
  games: Game[];
  loading: boolean;
}

export const GameCarousel: React.FC<GameCarouselProps> = ({ title, games, loading }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(games.length / itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  // Show 3 groups of 5 games each (total 15)
  const currentGames = games.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {games.length > itemsPerPage && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handlePrevious} color="primary">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={handleNext} color="primary">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      
      <Grid container spacing={1}>
        {loading
          ? Array.from({ length: 5 }, (_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} xl={2.4} key={index}>
                <Box>
                  <Box sx={{ height: 280, backgroundColor: 'grey.300', mb: 1, borderRadius: 1 }} />
                  <Box sx={{ height: 30, backgroundColor: 'grey.300', mb: 1, borderRadius: 1 }} />
                  <Box sx={{ height: 20, backgroundColor: 'grey.300', width: '60%', borderRadius: 1 }} />
                </Box>
              </Grid>
            ))
          : currentGames.map((game) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} xl={2.4} key={game.id}>
                <ProductCard item={game} type="game" compact={false} />
              </Grid>
            ))}
      </Grid>
      
      {!loading && games.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No se encontraron juegos en esta categoría aún.
        </Typography>
      )}
    </Paper>
  );
};

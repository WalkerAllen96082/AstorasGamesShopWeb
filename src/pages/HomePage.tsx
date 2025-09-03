import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { GameCarousel } from '../components/GameCarousel';
import { Banner } from '../components/Banner';
import { Game } from '../types';
import { supabase } from '../lib/supabase';

export const HomePage: React.FC = () => {
  const [mostViewed, setMostViewed] = useState<Game[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      // Fetch most viewed games
      const { data: mostViewedData, error: mostViewedError } = await supabase
        .from('games')
        .select('*')
        .order('views', { ascending: false })
        .limit(15);

      // Fetch newly added games
      const { data: newlyAddedData, error: newlyAddedError } = await supabase
        .from('games')
        .select('*')
        .or('status.eq.newly_added,status.eq.updated')
        .order('created_at', { ascending: false })
        .limit(15);

      if (mostViewedError) throw mostViewedError;
      if (newlyAddedError) throw newlyAddedError;

      setMostViewed(mostViewedData || []);
      setNewlyAdded(newlyAddedData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Banner />
      
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Bienvenido a la Tienda de Juegos de Astora
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          Descubre juegos increíbles, electrónicos y servicios. Encuentra tu próximo juego favorito o consigue el soporte técnico que necesitas.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <GameCarousel title="🔥 Juegos Más Vistos" games={mostViewed.slice(0, 15)} loading={loading} />
      <GameCarousel title="✨ Recién Agregados y Actualizados" games={newlyAdded.slice(0, 15)} loading={loading} />

      {/* Scroll to top button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <IconButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Box>
    </Layout>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ProductCard } from '../components/ProductCard';
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
        .limit(8);

      // Fetch newly added games
      const { data: newlyAddedData, error: newlyAddedError } = await supabase
        .from('games')
        .select('*')
        .or('status.eq.newly_added,status.eq.updated')
        .order('created_at', { ascending: false })
        .limit(8);

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

  const GameSection: React.FC<{ title: string; games: Game[]; loading: boolean }> = ({ title, games, loading }) => (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
                <Box>
                  <Skeleton variant="rectangular" height={160} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={60} />
                </Box>
              </Grid>
            ))
          : games.map((game) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={game.id}>
                <ProductCard item={game} type="game" compact={true} />
              </Grid>
            ))}
      </Grid>
      {!loading && games.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No games found in this category yet.
        </Typography>
      )}
    </Paper>
  );

  return (
    <Layout>
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
          Welcome to Astora's Games Shop
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          Discover amazing games, electronics, and services. Find your next favorite game or get the tech support you need.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Scroll to top button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <IconButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Box>
      <GameSection title="🔥 Most Viewed Games" games={mostViewed} loading={loading} />
      <GameSection title="✨ Newly Added & Updated" games={newlyAdded} loading={loading} />
    </Layout>
  );
};
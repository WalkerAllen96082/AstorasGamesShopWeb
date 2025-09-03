import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material';
import { ArrowBack as BackIcon, Add as AddIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { Game } from '../types';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGame(id);
      incrementViews(id);
    }
  }, [id]);

  const fetchGame = async (gameId: string) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (gameId: string) => {
    try {
      await supabase.rpc('increment_views', { game_id: gameId });
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  const handleAddToCart = () => {
    if (game) {
      addToCart(game, 'game');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={100} height={40} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="text" height={50} />
            <Skeleton variant="text" height={30} width="60%" />
            <Box sx={{ my: 2 }}>
              <Skeleton variant="rectangular" width={120} height={32} />
            </Box>
            <Skeleton variant="text" height={100} />
            <Skeleton variant="text" height={60} width="40%" />
          </Grid>
        </Grid>
      </Layout>
    );
  }

  if (error || !game) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Game not found'}
        </Alert>
        <Button onClick={() => navigate('/games')} startIcon={<BackIcon />}>
          Back to Games
        </Button>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{game?.name} - Astora's Games Shop</title>
        <meta property="og:title" content={game?.name} />
        <meta property="og:description" content={game?.description} />
        <meta property="og:image" content={game?.cover || '/placeholder.jpg'} />
        <meta property="og:type" content="product" />
      </Helmet>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/games')} sx={{ mb: 2 }}>
            <BackIcon />
          </IconButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card sx={{ position: 'relative' }}>
              {game.status && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontWeight: 600,
                    zIndex: 1,
                  }}
                >
                  {game.status === 'newly_added' ? 'Newly Added' : 'Updated'}
                </Box>
              )}
              <CardMedia
                component="img"
                height="500"
                image={game.cover}
                alt={game.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {game.name}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={game.platform} color="secondary" />
              <Chip label={game.year.toString()} variant="outlined" />
            </Box>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {game.size}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Platform
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {game.platform}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {game.year}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Views
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {game.views}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {game.description}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                {game.currency} ${game.price.toFixed(2)}
              </Typography>

              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleAddToCart}
                sx={{ px: 4, py: 1.5 }}
              >
                Add to Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Layout>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ProductCard } from '../components/ProductCard';
import { Game, Product, Service } from '../types';
import { supabase } from '../lib/supabase';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [games, setGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (query) {
      searchAll();
    }
  }, [query]);

  const searchAll = async () => {
    setLoading(true);
    try {
      // Search games
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .ilike('name', `%${query}%`);

      // Search products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`);

      // Search services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .ilike('name', `%${query}%`);

      if (gamesError || productsError || servicesError) {
        throw new Error('Search failed');
      }

      setGames(gamesData || []);
      setProducts(productsData || []);
      setServices(servicesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const totalResults = games.length + products.length + services.length;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
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
          Resultados de Búsqueda
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          {loading ? 'Buscando...' : `Se encontraron ${totalResults} resultados para "${query}"`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && totalResults === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No se encontraron resultados
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Intenta buscar con palabras clave diferentes.
          </Typography>
        </Paper>
      )}

      {totalResults > 0 && (
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`Juegos (${games.length})`} />
            <Tab label={`Productos (${products.length})`} />
            <Tab label={`Servicios (${services.length})`} />
          </Tabs>
        </Paper>
      )}

      {/* Games Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={index}>
                  <Box>
                    <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={60} />
                  </Box>
                </Grid>
              ))
            : games.map((game) => (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={game.id}>
                  <ProductCard item={game} type="game" />
                </Grid>
              ))}
        </Grid>
      )}

      {/* Products Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={index}>
                  <Box>
                    <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={60} />
                  </Box>
                </Grid>
              ))
            : products.map((product) => (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={product.id}>
                  <ProductCard item={product} type="product" />
                </Grid>
              ))}
        </Grid>
      )}

      {/* Services Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={index}>
                  <Box>
                    <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={60} />
                  </Box>
                </Grid>
              ))
            : services.map((service) => (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={service.id}>
                  <ProductCard item={service} type="service" />
                </Grid>
              ))}
        </Grid>
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
    </Layout>
  );
};
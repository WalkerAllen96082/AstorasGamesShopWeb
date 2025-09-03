import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { UniversalCarousel } from '../components/UniversalCarousel';
import { Banner } from '../components/Banner';
import { Game, Product, Service } from '../types';
import { supabase } from '../lib/supabase';

export const HomePage: React.FC = () => {
  const [mostViewed, setMostViewed] = useState<Game[]>([]);
  const [recentlyAddedServices, setRecentlyAddedServices] = useState<Service[]>([]);
  const [recentlyAddedProducts, setRecentlyAddedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch most viewed games
      const { data: mostViewedData, error: mostViewedError } = await supabase
        .from('games')
        .select('*')
        .order('views', { ascending: false })
        .limit(15);

      // Fetch recently added services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      // Fetch recently added products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (mostViewedError) throw mostViewedError;
      if (servicesError) throw servicesError;
      if (productsError) throw productsError;

      setMostViewed(mostViewedData || []);
      setRecentlyAddedServices(servicesData || []);
      setRecentlyAddedProducts(productsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
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

      <UniversalCarousel title="🔥 Juegos Más Vistos" items={mostViewed} type="game" loading={loading} />
      <UniversalCarousel title="🛠️ Servicios Recientemente Añadidos" items={recentlyAddedServices} type="service" loading={loading} />
      <UniversalCarousel title="📦 Productos Recientemente Añadidos" items={recentlyAddedProducts} type="product" loading={loading} />

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

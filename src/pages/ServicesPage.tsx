import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Skeleton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import { Search as SearchIcon, ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ProductCard } from '../components/ProductCard';
import { Service } from '../types';
import { supabase } from '../lib/supabase';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedServices = services
    .filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  const paginatedServices = filteredAndSortedServices.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);

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
          Servicios Ofrecidos
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          Servicios profesionales para ayudarte con tus necesidades tecnológicas. Soporte experto cuando más lo necesitas.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar servicios"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Ordenar por"
              >
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="price">Precio</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 20 }, (_, index) => (
              <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={index}>
                <Box>
                  <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={60} />
                </Box>
              </Grid>
            ))
          : paginatedServices.map((service) => (
              <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={service.id}>
                <ProductCard item={service} type="service" />
              </Grid>
            ))}
      </Grid>

      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index}
                variant={page === index ? 'contained' : 'outlined'}
                onClick={() => setPage(index)}
                size="small"
                sx={{ minWidth: 40 }}
              >
                {index + 1}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {!loading && filteredAndSortedServices.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No se encontraron servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm
              ? 'Intenta ajustar tus criterios de búsqueda.'
              : 'No se han agregado servicios aún.'}
          </Typography>
        </Paper>
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
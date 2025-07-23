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
import { Search as SearchIcon } from '@mui/icons-material';
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ProductCard } from '../components/ProductCard';
import { Game, Platform } from '../types';
import { supabase } from '../lib/supabase';

const platforms: Platform[] = [
  'PC Game',
  'PlayStation 4',
  'Nintendo Switch',
  'PlayStation 3',
  'Xbox 360',
  'Xbox One',
  'Xbox Series',
  'Nintendo WiiU',
  'Nintendo Wii',
  'Nintendo 3DS',
  'PlayStation 2',
  'PlayStation Portable',
];

export const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'year' | 'views'>('name');

  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedGames = games
    .filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || game.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'year':
          return b.year - a.year;
        case 'views':
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const paginatedGames = filteredAndSortedGames.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);

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
          Colección de Juegos
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          Descubre juegos increíbles en todas las plataformas. Desde los últimos lanzamientos hasta los clásicos favoritos.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar juegos"
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Plataforma</InputLabel>
              <Select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                label="Plataforma"
              >
                <MenuItem value="all">Todas las Plataformas</MenuItem>
                {platforms.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Ordenar por"
              >
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="price">Precio</MenuItem>
                <MenuItem value="year">Año</MenuItem>
                <MenuItem value="views">Más Vistos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 20 }, (_, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2.4} key={index}>
                <Box>
                  <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={60} />
                </Box>
              </Grid>
            ))
          : paginatedGames.map((game) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2.4} key={game.id}>
                <ProductCard item={game} type="game" />
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

      {!loading && filteredAndSortedGames.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No se encontraron juegos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || platformFilter !== 'all'
              ? 'Intenta ajustar tus criterios de búsqueda o filtro.'
              : 'No se han agregado juegos aún.'}
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
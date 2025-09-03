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
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ProductCard } from '../components/ProductCard';
import { Game, Platform, GameGenre } from '../types';
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
  'PlayStation Vita',
];

const gameGenres: GameGenre[] = [
  'Action',
  'Action RPG',
  'Aventura Gráfica',
  'Aventura-Acción',
  'Beat Em-Up',
  'Conducción',
  'Estrategia',
  'Fighting',
  'Hack and Slash',
  'Metroidvania',
  'MMO',
  'Musou',
  'Plataformas',
  'Rogelike',
  'RPG',
  'Shooter',
  'Simulación',
  'Sports',
  'Survival',
  'Survival Horror',
];

export const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
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
      const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
      const matchesGenre = genreFilter === 'all' || (game as any).genre === genreFilter;
      return matchesSearch && matchesPlatform && matchesStatus && matchesGenre;
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

  const showStatusFilters = platformFilter === 'PC Game' || platformFilter === 'PlayStation 4' || platformFilter === 'Nintendo Switch';
  const showGenreFilters = platformFilter === 'PC Game';

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

      {/* Platform Filter Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtrar por Plataforma
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label="Todas"
            onClick={() => {
              setPlatformFilter('all');
              setStatusFilter('all');
              setGenreFilter('all');
            }}
            color={platformFilter === 'all' ? 'primary' : 'default'}
            variant={platformFilter === 'all' ? 'filled' : 'outlined'}
          />
          {platforms.map((platform) => (
            <Chip
              key={platform}
              label={platform}
              onClick={() => {
                setPlatformFilter(platform);
                setStatusFilter('all');
                setGenreFilter('all');
              }}
              color={platformFilter === platform ? 'primary' : 'default'}
              variant={platformFilter === platform ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* Status Filters */}
        {showStatusFilters && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filtrar por Estado
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Todos"
                onClick={() => setStatusFilter('all')}
                color={statusFilter === 'all' ? 'secondary' : 'default'}
                variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Recién Agregados"
                onClick={() => setStatusFilter('newly_added')}
                color={statusFilter === 'newly_added' ? 'secondary' : 'default'}
                variant={statusFilter === 'newly_added' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Actualizados"
                onClick={() => setStatusFilter('updated')}
                color={statusFilter === 'updated' ? 'secondary' : 'default'}
                variant={statusFilter === 'updated' ? 'filled' : 'outlined'}
                size="small"
              />
            </Box>
          </Box>
        )}

        {/* Genre Filters for PC Games */}
        {showGenreFilters && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Filtrar por Género
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Todos"
                onClick={() => setGenreFilter('all')}
                color={genreFilter === 'all' ? 'success' : 'default'}
                variant={genreFilter === 'all' ? 'filled' : 'outlined'}
                size="small"
              />
              {gameGenres.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  onClick={() => setGenreFilter(genre)}
                  color={genreFilter === genre ? 'success' : 'default'}
                  variant={genreFilter === genre ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

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

      <Grid container spacing={1}>
        {loading
          ? Array.from({ length: 20 }, (_, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={index}>
                <Box>
                  <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={60} />
                </Box>
              </Grid>
            ))
          : paginatedGames.map((game) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={game.id}>
                <ProductCard item={game} type="game" compact={false} />
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
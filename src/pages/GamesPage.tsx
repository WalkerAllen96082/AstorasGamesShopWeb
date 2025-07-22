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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
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
          Games Collection
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          Discover amazing games across all platforms. From the latest releases to classic favorites.
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
              label="Search games"
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
              <InputLabel>Platform</InputLabel>
              <Select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                label="Platform"
              >
                <MenuItem value="all">All Platforms</MenuItem>
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
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Sort by"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="year">Year</MenuItem>
                <MenuItem value="views">Most Viewed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 8 }, (_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Box>
                  <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={60} />
                </Box>
              </Grid>
            ))
          : filteredAndSortedGames.map((game) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                <ProductCard item={game} type="game" />
              </Grid>
            ))}
      </Grid>

      {!loading && filteredAndSortedGames.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No games found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || platformFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No games have been added yet.'}
          </Typography>
        </Paper>
      )}
    </Layout>
  );
};
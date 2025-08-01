import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { supabase } from '../lib/supabase';

interface BannerData {
  id: string;
  title: string;
  content: string;
  active: boolean;
  created_at: string;
}

export const Banner: React.FC = () => {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBanner(data);
    } catch (err) {
      console.error('Error fetching banner:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !banner) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {banner.title}
      </Typography>
      <Typography variant="body1">
        {banner.content}
      </Typography>
    </Paper>
  );
};
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface BannerData {
  id: string;
  title: string;
  content: string;
  image?: string;
  active: boolean;
  created_at: string;
}

export const Banner: React.FC = () => {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 10000); // Cambiar cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBanners(data || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <Paper
      sx={{
        position: 'relative',
        mb: 4,
        overflow: 'hidden',
        minHeight: isMobile ? 200 : 300,
        display: 'flex',
        alignItems: 'center',
        background: currentBanner.image 
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${currentBanner.image})`
          : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}
    >
      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
              zIndex: 2,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
              zIndex: 2,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {/* Banner Content */}
      <Box
        sx={{
          p: isMobile ? 2 : 4,
          textAlign: 'center',
          width: '100%',
          zIndex: 1,
        }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {currentBanner.title}
        </Typography>
        <Typography 
          variant={isMobile ? "body1" : "h6"}
          sx={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          {currentBanner.content}
        </Typography>
      </Box>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 2,
          }}
        >
          {banners.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material';
import { ArrowBack as BackIcon, Add as AddIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { Service } from '../types';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (service) {
      addToCart(service, 'service');
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

  if (error || !service) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Service not found'}
        </Alert>
        <Button onClick={() => navigate('/services')} startIcon={<BackIcon />}>
          Back to Services
        </Button>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service?.name} - Astora's Games Shop</title>
        <meta property="og:title" content={service?.name} />
        <meta property="og:description" content={service?.description} />
        <meta property="og:image" content={service?.cover || '/placeholder.jpg'} />
        <meta property="og:type" content="product" />
      </Helmet>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/services')} sx={{ mb: 2 }}>
            <BackIcon />
          </IconButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardMedia
                component="img"
                height="500"
                image={service.cover}
                alt={service.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {service.name}
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {service.duration || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Currency
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {service.currency}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {service.description}
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
                {service.currency} ${service.price.toFixed(2)}
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

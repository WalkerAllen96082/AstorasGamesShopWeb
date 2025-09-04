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
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 'product');
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

  if (error || !product) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Product not found'}
        </Alert>
        <Button onClick={() => navigate('/products')} startIcon={<BackIcon />}>
          Back to Products
        </Button>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product?.name} - Astora's Games Shop</title>
        <meta property="og:title" content={product?.name} />
        <meta property="og:description" content={product?.description} />
        <meta
          property="og:image"
          content={
            product?.image
              ? `https://webshopastoras.netlify.app${product.image.startsWith('/') ? '' : '/'}${product.image}`
              : 'https://webshopastoras.netlify.app/placeholder.jpg'
          }
        />
        <meta property="og:type" content="product" />
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.name} />
        <meta name="twitter:description" content={product?.description} />
        <meta
          name="twitter:image"
          content={
            product?.image
              ? `https://webshopastoras.netlify.app${product.image.startsWith('/') ? '' : '/'}${product.image}`
              : 'https://webshopastoras.netlify.app/placeholder.jpg'
          }
        />
      </Helmet>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/products')} sx={{ mb: 2 }}>
            <BackIcon />
          </IconButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardMedia
                component="img"
                height="500"
            image={
              product?.image
                ? `https://webshopastoras.netlify.app${product.image.startsWith('/') ? '' : '/'}${product.image}`
                : 'https://webshopastoras.netlify.app/placeholder.jpg'
            }
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={product.category} color="secondary" />
            </Box>

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {product.description}
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
                {product.currency} ${product.price.toFixed(2)}
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

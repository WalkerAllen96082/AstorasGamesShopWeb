import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';

import { Game, Product, Service } from '../types';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  item: Game | Product | Service;
  type: 'game' | 'product' | 'service';
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, type, compact = false }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, type);
  };

  const handleViewDetails = () => {
    if (type === 'game') {
      navigate(`/games/${item.id}`);
    } else if (type === 'product') {
      navigate(`/products/${item.id}`);
    } else if (type === 'service') {
      navigate(`/services/${item.id}`);
    }
  };

  const getCover = () => {
    if ('cover' in item) return item.cover;
    if ('image' in item) return item.image;
    return '/placeholder-image.jpg';
  };

  const getStatusWatermark = () => {
    if ('status' in item && item.status) {
      const statusText = item.status === 'newly_added' ? 'Newly Added' : 'Updated';
      return (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'primary.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 1,
          }}
        >
          {statusText}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card
      sx={{
        height: type === 'game' ? (compact ? 280 : 360) : (compact ? 320 : 420),
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        position: 'relative',
       maxWidth: compact ? 160 : 200,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme =>
            theme.palette.mode === 'dark'
              ? '0 8px 25px rgba(0,0,0,0.4)'
              : '0 8px 25px rgba(0,0,0,0.15)',
        },
      }}
      onClick={handleViewDetails}
    >
      {getStatusWatermark()}
      
      <CardMedia
        component="img"
       height={compact ? 180 : 280}
        image={getCover()}
        alt={item.name}
        sx={{ 
          objectFit: 'cover',
          width: '100%',
         maxHeight: compact ? 180 : 280,
        }}
      />
      
     <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: compact ? 0.8 : 1.5 }}>
        <Typography gutterBottom variant={compact ? 'body2' : 'h6'} component="div" noWrap>
          {item.name}
        </Typography>

        <Typography
          variant={compact ? 'caption' : 'body2'}
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
           WebkitLineClamp: type === 'service' ? (compact ? 3 : 4) : (compact ? 2 : 3),
            WebkitBoxOrient: 'vertical',
           mb: compact ? 0.8 : 1.5,
           fontSize: compact ? '0.65rem' : '0.875rem',
           lineHeight: compact ? 1.2 : 1.4,
           maxHeight: type === 'service' ? (compact ? '4.5em' : '6em') : (compact ? '3em' : '4.5em'),
          }}
        >
          {item.description}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
          {type === 'game' && ('platform' in item || 'year' in item) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {'platform' in item && (
                <Chip
                  label={(item as Game).platform}
                  size={compact ? 'small' : 'small'}
                  color="secondary"
                  sx={{ fontSize: compact ? '0.6rem' : '0.7rem' }}
                />
              )}
              {'year' in item && (
                <Chip
                  label={(item as Game).year.toString()}
                  size={compact ? 'small' : 'small'}
                  sx={{ backgroundColor: 'gold', color: 'black', fontSize: compact ? '0.6rem' : '0.7rem' }}
                />
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
               variant={compact ? 'caption' : 'h6'}
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                 fontSize: compact ? '0.7rem' : '1rem',
                }}
              >
                ${item.price.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: compact ? '0.6rem' : '0.7rem' }}>
                {item.currency}
              </Typography>
            </Box>

            <Button
              size={compact ? 'small' : 'medium'}
              variant="contained"
              onClick={handleAddToCart}
              sx={{
                minWidth: 'auto',
               fontSize: compact ? '0.8rem' : '1rem',
               px: compact ? 0.5 : 1,
               py: compact ? 0.3 : 0.5,
              }}
            >
             ADD
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
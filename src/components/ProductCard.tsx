import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        position: 'relative',
        maxWidth: compact ? 180 : 220,
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
       height={compact ? 120 : 180}
        image={getCover()}
        alt={item.name}
        sx={{ 
          objectFit: 'cover',
          width: '100%',
         maxHeight: compact ? 120 : 180,
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, p: compact ? 1 : 2 }}>
        <Typography gutterBottom variant={compact ? 'body2' : 'h6'} component="div" noWrap>
          {item.name}
        </Typography>

        {type === 'game' && 'platform' in item && (
          <Chip
            label={item.platform}
            size={compact ? 'small' : 'small'}
            color="secondary"
            sx={{ mb: compact ? 0.5 : 1, fontSize: compact ? '0.65rem' : '0.75rem' }}
          />
        )}

        {type === 'game' && 'year' in item && (
          <Typography variant={compact ? 'caption' : 'body2'} color="text.secondary" sx={{ mb: compact ? 0.5 : 1 }}>
            {compact ? item.year : `${item.year} • ${('size' in item) ? item.size : 'N/A'}`}
          </Typography>
        )}

        <Typography
          variant={compact ? 'caption' : 'body2'}
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 1 : 3,
            WebkitBoxOrient: 'vertical',
            mb: compact ? 1 : 2,
          }}
        >
          {item.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography
            variant={compact ? 'body2' : 'h5'}
            component="div"
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            {item.currency} ${item.price.toFixed(2)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size={compact ? 'small' : 'small'} onClick={handleViewDetails} color="primary">
              <ViewIcon />
            </IconButton>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddToCart}
              sx={{ minWidth: 'auto', fontSize: compact ? '0.7rem' : '0.875rem' }}
            >
              {compact ? '' : 'Add'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
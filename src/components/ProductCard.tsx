import React, { useState, useEffect, useRef } from 'react';
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

const DynamicFontSizeText: React.FC<{ text: string; maxFontSize: number; minFontSize: number; style?: React.CSSProperties }> = ({
  text,
  maxFontSize,
  minFontSize,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!containerRef.current || !textRef.current) return;
      let currentFontSize = maxFontSize;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      textRef.current.style.fontSize = `${currentFontSize}px`;

      while (
        (textRef.current.scrollWidth > containerWidth || textRef.current.scrollHeight > containerHeight) &&
        currentFontSize > minFontSize
      ) {
        currentFontSize -= 1;
        textRef.current.style.fontSize = `${currentFontSize}px`;
      }
      setFontSize(currentFontSize);
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [text, maxFontSize, minFontSize]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', ...style, overflow: 'hidden' }}>
      <div ref={textRef} style={{ fontSize, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
        {text}
      </div>
    </div>
  );
};

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
        height: type === 'game' ? (compact ? 280 : 320) : (compact ? 280 : 350),
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

      <Box sx={{ position: 'relative', backgroundColor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardMedia
          component="img"
          height={compact ? 180 : 280}
          image={getCover()}
          alt={item.name}
          sx={{
            objectFit: 'contain',
            width: '100%',
            maxHeight: compact ? 180 : 280,
          }}
        />
        {/* ADD button top right */}
        <Button
          size={compact ? 'small' : 'medium'}
          variant="contained"
          onClick={handleAddToCart}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'gold',
            color: 'black',
            fontWeight: 'bold',
            minWidth: 'auto',
            fontSize: compact ? '0.7rem' : '1rem',
            px: compact ? 0.5 : 1,
            py: compact ? 0.3 : 0.5,
            zIndex: 2,
            '&:hover': {
              backgroundColor: '#d4af37',
            },
          }}
        >
          ADD
        </Button>

        {/* Platform chip bottom left */}
        {'platform' in item && (
          <Chip
            label={(item as Game).platform}
            size={compact ? 'small' : 'medium'}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'gold',
              color: 'black',
              fontWeight: 'bold',
              fontSize: compact ? '0.6rem' : '0.8rem',
              zIndex: 2,
            }}
          />
        )}

        {/* Year chip bottom right */}
        {'year' in item && (
          <Chip
            label={(item as Game).year.toString()}
            size={compact ? 'small' : 'medium'}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'gold',
              color: 'black',
              fontWeight: 'bold',
              fontSize: compact ? '0.6rem' : '0.8rem',
              zIndex: 2,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: compact ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: compact ? 0.8 : 1.5 }}>
          <DynamicFontSizeText
            text={item.name}
            maxFontSize={compact ? 16 : 20}
            minFontSize={10}
            style={{ fontWeight: 'bold', flex: 1, marginRight: '8px' }}
          />
          <Typography
            variant={compact ? 'caption' : 'h6'}
            component="div"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: compact ? '0.7rem' : '1rem',
              whiteSpace: 'nowrap',
            }}
          >
            ${item.price.toFixed(2)}
          </Typography>
        </Box>
        {(type === 'product' || type === 'service') && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: compact ? '0.6rem' : '0.8rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

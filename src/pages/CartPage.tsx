import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';

export const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const phoneNumber = '+5353197867';
  const email = 'alfreboss9608@gmail.com';

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const generateCartMessage = () => {
    let message = "🛒 *Astora's Games Shop - Order Details*\n\n";
    
    items.forEach((item: CartItem, index: number) => {
      message += `${index + 1}. *${item.item.name}*\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ${item.item.currency} $${item.item.price.toFixed(2)} each\n`;
      message += `   Subtotal: ${item.item.currency} $${(item.item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `💰 *Total: $${getTotalPrice().toFixed(2)}*\n\n`;
    message += "Please confirm this order and provide payment details. Thank you! 🎮";
    
    return message;
  };

  const handleWhatsApp = () => {
    const message = generateCartMessage();
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(`whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank');
    }
  };

  const handleTelegram = () => {
    const message = generateCartMessage();
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleEmail = () => {
    const message = generateCartMessage();
    const subject = encodeURIComponent("Astora's Games Shop - New Order");
    const encodedMessage = encodeURIComponent(message);
    window.open(`mailto:${email}?subject=${subject}&body=${encodedMessage}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add some amazing games, products, or services to your cart!
          </Typography>
          <Button variant="contained" href="/">
            Start Shopping
          </Button>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Shopping Cart ({items.length} items)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {items.map((item: CartItem) => (
            <Card key={`${item.type}-${item.id}`} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={('cover' in item.item) ? item.item.cover : ('image' in item.item) ? item.item.image : '/placeholder.jpg'}
                      alt={item.item.name}
                      sx={{ objectFit: 'cover', borderRadius: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                      {item.item.name}
                    </Typography>
                    
                    {item.type === 'game' && 'platform' in item.item && (
                      <Typography variant="body2" color="text.secondary">
                        Platform: {item.item.platform}
                      </Typography>
                    )}
                    
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {item.item.currency} ${item.item.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <IconButton 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        sx={{ 
                          mx: 1, 
                          width: '60px',
                          '& input': { textAlign: 'center' }
                        }}
                        inputProps={{ min: 1, type: 'number' }}
                      />
                      
                      <IconButton 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="h6">
                        {item.item.currency} ${(item.item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <IconButton 
                        onClick={() => removeFromCart(item.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {items.map((item: CartItem) => (
                <Box key={`${item.type}-${item.id}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.item.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${(item.item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                ${getTotalPrice().toFixed(2)}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Choose your preferred contact method to complete your order:
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<WhatsAppIcon />}
                onClick={handleWhatsApp}
                sx={{ 
                  backgroundColor: '#25D366',
                  '&:hover': { backgroundColor: '#128C7E' }
                }}
              >
                Order via WhatsApp
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<TelegramIcon />}
                onClick={handleTelegram}
                sx={{ 
                  borderColor: '#0088cc',
                  color: '#0088cc',
                  '&:hover': { backgroundColor: '#0088cc', color: 'white' }
                }}
              >
                Order via Telegram
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<EmailIcon />}
                onClick={handleEmail}
              >
                Order via Email
              </Button>
            </Box>

            <Button
              variant="text"
              fullWidth
              onClick={clearCart}
              sx={{ mt: 2, color: 'error.main' }}
            >
              Clear Cart
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Box,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ManageAccounts as AdminIcon,
  Games as GamesIcon,
  Devices as DevicesIcon,
  Build as ServicesIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { label: 'Games', path: '/games', icon: <GamesIcon /> },
    { label: 'Products', path: '/products', icon: <DevicesIcon /> },
    { label: 'Services', path: '/services', icon: <ServicesIcon /> },
  ];

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ gap: 2 }}>
        {/* Logo and Title */}
        <Box display="flex" alignItems="center" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          <GamesIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Astora's Games Shop
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 1,
            px: 2,
            py: 0.5,
            flexGrow: 1,
            maxWidth: 400,
          }}
        >
          <SearchIcon sx={{ mr: 1, color: 'white' }} />
          <InputBase
            placeholder="Search games, products, services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'white',
              width: '100%',
              '& ::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Navigation Menu */}
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      handleMenuClose();
                    }}
                    selected={location.pathname === item.path}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.icon}
                      {item.label}
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              >
                {item.label}
              </Button>
            ))
          )}

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Cart Button */}
          <IconButton color="inherit" onClick={() => navigate('/cart')}>
            <Badge badgeContent={getItemCount()} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Admin Button */}
          <IconButton color="inherit" onClick={() => navigate('/admin')}>
            <AdminIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
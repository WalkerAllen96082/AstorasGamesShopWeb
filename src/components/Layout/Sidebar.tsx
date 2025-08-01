import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  Games as GamesIcon,
  Devices as DevicesIcon,
  Build as ServicesIcon,
  ShoppingCart as CartIcon,
  ManageAccounts as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <HomeIcon /> },
    { label: 'Juegos', path: '/games', icon: <GamesIcon /> },
    { label: 'Productos', path: '/products', icon: <DevicesIcon /> },
    { label: 'Servicios', path: '/services', icon: <ServicesIcon /> },
    { label: 'Carrito', path: '/cart', icon: <CartIcon /> },
    { label: 'Administración', path: '/admin', icon: <AdminIcon /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 600 }}>
          Navegación
        </Typography>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
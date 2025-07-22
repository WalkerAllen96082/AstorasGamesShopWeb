import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Games as GamesIcon,
  Devices as ProductsIcon,
  Build as ServicesIcon,
  Add as AddIcon,
  List as ListIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Layout } from '../Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { ProductManager } from './ProductManager';
import { ProductList } from './ProductList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<AddIcon />} label="Add Products" />
          <Tab icon={<ListIcon />} label="Manage Products" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <GamesIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                0
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Games
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ProductsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                0
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Products
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ServicesIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                0
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Services
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ProductManager />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ProductList />
      </TabPanel>
    </Layout>
  );
};
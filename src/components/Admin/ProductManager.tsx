import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon } from '@mui/icons-material';
import { ProductForm } from './ProductForm';
import { BulkImport } from './BulkImport';

export const ProductManager: React.FC = () => {
  const [productType, setProductType] = useState<'game' | 'product' | 'service'>('game');
  const [addMode, setAddMode] = useState<'single' | 'bulk' | null>(null);

  const resetForm = () => {
    setAddMode(null);
  };

  if (addMode === 'single') {
    return <ProductForm type={productType} onCancel={resetForm} onSuccess={resetForm} />;
  }

  if (addMode === 'bulk') {
    return <BulkImport type={productType} onCancel={resetForm} onSuccess={resetForm} />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Add New Products
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Product Type</InputLabel>
            <Select
              value={productType}
              onChange={(e) => setProductType(e.target.value as 'game' | 'product' | 'service')}
              label="Product Type"
            >
              <MenuItem value="game">Game</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="service">Service</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            How would you like to add {productType}s?
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMode('single')}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Add One at a Time
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setAddMode('bulk')}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Bulk Import (CSV)
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
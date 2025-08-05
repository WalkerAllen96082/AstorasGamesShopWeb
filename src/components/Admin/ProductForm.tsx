import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Image as ImageIcon, Upload as UploadIcon, Link as LinkIcon } from '@mui/icons-material';
import { Platform } from '../../types';
import { supabase } from '../../lib/supabase';

const platforms: Platform[] = [
  'PC Game',
  'PlayStation 4',
  'Nintendo Switch',
  'PlayStation 3',
  'Xbox 360',
  'Xbox One',
  'Xbox Series',
  'Nintendo WiiU',
  'Nintendo Wii',
  'Nintendo 3DS',
  'PlayStation 2',
  'PlayStation Portable',
];

interface ProductFormProps {
  type: 'game' | 'product' | 'service';
  onCancel: () => void;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ type, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    cover: '',
    name: '',
    size: '',
    year: new Date().getFullYear(),
    platform: platforms[0] as Platform,
    price: 0,
    currency: 'USD' as 'USD' | 'CUP',
    description: '',
    status: null as 'newly_added' | 'updated' | null,
    category: 'electronics' as 'electronics' | 'accessory',
    duration: '',
  });

  const [statusChecked, setStatusChecked] = useState({
    newly_added: false,
    updated: false,
  });

  const [imageTab, setImageTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange('cover', result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleStatusChange = (statusType: 'newly_added' | 'updated') => {
    const newStatusChecked = {
      newly_added: statusType === 'newly_added' ? !statusChecked.newly_added : false,
      updated: statusType === 'updated' ? !statusChecked.updated : false,
    };
    
    setStatusChecked(newStatusChecked);
    
    const activeStatus = newStatusChecked.newly_added ? 'newly_added' : 
                        newStatusChecked.updated ? 'updated' : null;
    
    handleInputChange('status', activeStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let tableName = '';
      let data: any = {};

      if (type === 'game') {
        tableName = 'games';
        data = {
          cover: formData.cover,
          name: formData.name,
          size: formData.size,
          year: formData.year,
          platform: formData.platform,
          price: formData.price,
          currency: formData.currency,
          description: formData.description,
          status: formData.status,
          views: 0,
        };
      } else if (type === 'product') {
        tableName = 'products';
        data = {
          name: formData.name,
          price: formData.price,
          currency: formData.currency,
          description: formData.description,
          image: formData.cover,
          category: formData.category,
        };
      } else if (type === 'service') {
        tableName = 'services';
        data = {
          name: formData.name,
          price: formData.price,
          currency: formData.currency,
          description: formData.description,
          cover: formData.cover,
          duration: formData.duration,
        };
      }

      const { error } = await supabase
        .from(tableName)
        .insert([data]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="success">
          {type.charAt(0).toUpperCase() + type.slice(1)} added successfully!
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Add New {type.charAt(0).toUpperCase() + type.slice(1)}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Imagen de Portada
              </Typography>
              <Tabs value={imageTab} onChange={(_, newValue) => setImageTab(newValue)} sx={{ mb: 2 }}>
                <Tab icon={<LinkIcon />} label="URL" />
                <Tab icon={<UploadIcon />} label="Subir Archivo" />
              </Tabs>
              
              {imageTab === 0 ? (
                <TextField
                  fullWidth
                  label="URL de la Imagen"
                  value={formData.cover}
                  onChange={(e) => handleInputChange('cover', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              ) : (
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Seleccionar Imagen
                    </Button>
                  </label>
                  {selectedFile && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Archivo seleccionado: {selectedFile.name}
                    </Typography>
                  )}
                </Box>
              )}
              
              {(formData.cover || imagePreview) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Vista previa:
                  </Typography>
                  <img
                    src={imagePreview || formData.cover}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxWidth: 300,
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #ddd'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </Grid>

          {type === 'game' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Size"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g., 50 GB"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    label="Platform"
                  >
                    {platforms.map((platform) => (
                      <MenuItem key={platform} value={platform}>
                        {platform}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {type === 'product' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="accessory">Accessory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {type === 'service' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 1 hour, 30 minutes"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="USD">USD (United States Dollar)</MenuItem>
                <MenuItem value="CUP">CUP (Cuban Pesos)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </Grid>

          {(type === 'game' || type === 'service') && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Status (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusChecked.newly_added}
                      onChange={() => handleStatusChange('newly_added')}
                    />
                  }
                  label="Newly Added"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusChecked.updated}
                      onChange={() => handleStatusChange('updated')}
                    />
                  }
                  label="Updated"
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                startIcon={<CancelIcon />}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Product'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
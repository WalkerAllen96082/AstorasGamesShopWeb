import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { Game, Product, Service } from '../../types';
import { BulkActions } from './BulkActions';

interface ProductListProps {
  onEdit?: (item: any) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onEdit }) => {
  const [products, setProducts] = useState<(Game | Product | Service)[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'game' | 'product' | 'service'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any; type: string }>({
    open: false,
    item: null,
    type: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [filterType, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let allProducts: (Game | Product | Service)[] = [];

      if (filterType === 'all' || filterType === 'game') {
        const { data: games } = await supabase
          .from('games')
          .select('*')
          .order(sortBy, { ascending: sortOrder === 'asc' });
        if (games) {
          allProducts.push(...games.map(game => ({ ...game, type: 'game' })));
        }
      }

      if (filterType === 'all' || filterType === 'product') {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .order(sortBy === 'created_at' ? 'created_at' : sortBy, { ascending: sortOrder === 'asc' });
        if (products) {
          allProducts.push(...products.map(product => ({ ...product, type: 'product' })));
        }
      }

      if (filterType === 'all' || filterType === 'service') {
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .order(sortBy === 'created_at' ? 'created_at' : sortBy, { ascending: sortOrder === 'asc' });
        if (services) {
          allProducts.push(...services.map(service => ({ ...service, type: 'service' })));
        }
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (item: any, type: string) => {
    setDeleteDialog({ open: true, item, type });
  };

  const handleDeleteConfirm = async () => {
    const { item, type } = deleteDialog;
    try {
      const tableName = type === 'game' ? 'games' : type === 'product' ? 'products' : 'services';
      await supabase.from(tableName).delete().eq('id', item.id);
      fetchProducts();
      setDeleteDialog({ open: false, item: null, type: '' });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedProducts.map((p: any) => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const isAllSelected = paginatedProducts.length > 0 && selectedItems.length === paginatedProducts.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < paginatedProducts.length;

  return (
    <Box>
      <BulkActions
        selectedItems={selectedItems}
        itemType={filterType === 'all' ? 'game' : filterType}
        onSuccess={() => {
          fetchProducts();
          setSelectedItems([]);
        }}
        onClearSelection={() => setSelectedItems([])}
      />
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Catálogo de Productos
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar productos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Tipo</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                label="Filtrar por Tipo"
              >
                <MenuItem value="all">Todos los Productos</MenuItem>
                <MenuItem value="game">Juegos</MenuItem>
                <MenuItem value="product">Productos</MenuItem>
                <MenuItem value="service">Servicios</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Ordenar por"
              >
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="price">Precio</MenuItem>
                <MenuItem value="created_at">Fecha Agregado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Orden</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                label="Orden"
              >
                <MenuItem value="asc">Ascendente</MenuItem>
                <MenuItem value="desc">Descendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Plataforma</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product: any) => (
                <TableRow key={`${product.type}-${product.id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(product.id)}
                      onChange={(e) => handleSelectItem(product.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.type === 'game' ? 'Juego' : product.type === 'product' ? 'Producto' : 'Servicio'}
                      color={
                        product.type === 'game' ? 'primary' :
                        product.type === 'product' ? 'secondary' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {product.currency} ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {product.platform || product.category || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {product.status && (
                      <Chip
                        label={product.status === 'newly_added' ? 'Nuevo' : 'Actualizado'}
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary" onClick={() => onEdit && onEdit(product)}>
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary" onClick={() => onEdit && onEdit(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(product, product.type)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredProducts.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null, type: '' })}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            ¿Estás seguro de que quieres eliminar "{deleteDialog.item?.name}"? Esta acción no se puede deshacer.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, item: null, type: '' })}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};
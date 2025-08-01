import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Delete as DeleteIcon, SelectAll as SelectAllIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabase';

interface BulkActionsProps {
  selectedItems: string[];
  itemType: 'game' | 'product' | 'service';
  onSuccess: () => void;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  itemType,
  onSuccess,
  onClearSelection,
}) => {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBulkDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const tableName = itemType === 'game' ? 'games' : itemType === 'product' ? 'products' : 'services';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      setDeleteDialog(false);
      onClearSelection();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar elementos');
    } finally {
      setLoading(false);
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <Paper sx={{ p: 2, mb: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {selectedItems.length} elemento(s) seleccionado(s)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialog(true)}
              disabled={loading}
            >
              Eliminar Seleccionados
            </Button>
            <Button
              variant="outlined"
              onClick={onClearSelection}
              disabled={loading}
            >
              Limpiar Selección
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación Masiva</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            ¿Estás seguro de que quieres eliminar {selectedItems.length} elemento(s)? 
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Todo'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Upload as UploadIcon, Download as DownloadIcon, Cancel as CancelIcon } from '@mui/icons-material';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';

interface BulkImportProps {
  type: 'game' | 'product' | 'service';
  onCancel: () => void;
  onSuccess: () => void;
}

export const BulkImport: React.FC<BulkImportProps> = ({ type, onCancel, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getRequiredFields = () => {
    if (type === 'game') {
      return ['cover', 'name', 'size', 'year', 'platform', 'price', 'currency', 'description', 'status', 'genre'];
    } else if (type === 'product') {
      return ['name', 'price', 'currency', 'description', 'image', 'category'];
    } else {
      return ['cover', 'name', 'price', 'currency', 'description', 'duration'];
    }
  };

  const generateTemplate = () => {
    const fields = getRequiredFields();
    let csvContent = fields.join(',') + '\n';
    
    // Add example row for better understanding
    if (type === 'game') {
      csvContent += 'https://example.com/cover.jpg,Game Name,50 GB,2024,PC Game,29.99,USD,Game description,newly_added,Action\n';
    } else if (type === 'product') {
      csvContent += 'Product Name,99.99,USD,Product description,https://example.com/image.jpg,electronics\n';
    } else {
      csvContent += 'https://example.com/cover.jpg,Service Name,49.99,USD,Service description,1 hour\n';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_import_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError('');

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMsg = results.errors[0].message;
          setError(`CSV parsing error: ${errorMsg}. Please ensure your CSV has the correct format with all required fields: ${getRequiredFields().join(', ')}`);
          return;
        }
        
        // Filter out empty rows and validate
        const validData = (results.data as any[]).filter(row => {
          // Check if row has at least some data
          return Object.values(row).some(value => value && String(value).trim() !== '');
        });
        
        if (validData.length === 0) {
          setError('No valid data found in CSV. Please check your file format.');
          return;
        }
        
        // Validate required fields
        const requiredFields = getRequiredFields();
        const headers = Object.keys(validData[0] || {});
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          setError(`Missing required fields: ${missingFields.join(', ')}. Please ensure your CSV has all required columns.`);
          return;
        }
        
        setData(validData);
      },
    });
  };

  const processData = (rawData: any[]) => {
    return rawData.map((row: any) => {
      if (type === 'game') {
        return {
          cover: row.cover || '',
          name: row.name || '',
          size: row.size || '',
          year: parseInt(row.year) || new Date().getFullYear(),
          platform: row.platform || '',
          price: parseFloat(row.price) || 0,
          currency: row.currency || 'USD',
          description: row.description || '',
          status: row.status === 'newly_added' || row.status === 'updated' ? row.status : null,
          genre: row.genre || null,
          views: 0,
        };
      } else if (type === 'product') {
        return {
          name: row.name || '',
          price: parseFloat(row.price) || 0,
          currency: row.currency || 'USD',
          description: row.description || '',
          image: row.image || '',
          category: row.category || 'electronics',
        };
      } else {
        return {
          name: row.name || '',
          price: parseFloat(row.price) || 0,
          currency: row.currency || 'USD',
          description: row.description || '',
          cover: row.cover || '',
          duration: row.duration || '',
        };
      }
    });
  };

  const handleImport = async () => {
    if (!data.length) return;

    setLoading(true);
    setError('');

    try {
      const processedData = processData(data);
      const tableName = type === 'game' ? 'games' : type === 'product' ? 'products' : 'services';

      const { error } = await supabase
        .from(tableName)
        .insert(processedData);

      if (error) throw error;

      setSuccess(`Successfully imported ${processedData.length} ${type}s!`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Bulk Import {type.charAt(0).toUpperCase() + type.slice(1)}s
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Step 1: Download Template
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={generateTemplate}
          sx={{ mb: 2 }}
        >
          Download CSV Template
        </Button>
        <Typography variant="body2" color="text.secondary">
          Download the template file and fill it with your {type} data. Required fields: {getRequiredFields().join(', ')}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Step 2: Upload Your CSV File
        </Typography>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            sx={{ mb: 2 }}
          >
            Choose CSV File
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
            Selected: {file.name}
          </Typography>
        )}
      </Box>

      {data.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Step 3: Review Data ({data.length} rows)
          </Typography>
          <TableContainer sx={{ mb: 3, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {getRequiredFields().map((field) => (
                    <TableCell key={field}>{field}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {getRequiredFields().map((field) => (
                      <TableCell key={field}>{row[field] || 'N/A'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 10 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing first 10 rows of {data.length} total rows
            </Typography>
          )}
        </>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancel
        </Button>
        {data.length > 0 && (
          <Button
            variant="contained"
            onClick={handleImport}
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            {loading ? 'Importing...' : `Import ${data.length} Items`}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
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

// Global rate limiting state
let lastRequestTime = 0;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
const BASE_DELAY = 5000; // Reduced to 5 seconds for faster imports
const MAX_DELAY = 15000; // Reduced to 15 seconds maximum

// LibreTranslate API function (free, open source, better quality than Lingva)
const translateWithLibre = async (text: string): Promise<string | null> => {
  try {
    console.log('🔄 Attempting LibreTranslate API call...');
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'es',
        format: 'text'
      })
    });

    console.log('📊 LibreTranslate response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      const translatedText = data.translatedText;
      console.log('📝 LibreTranslate raw response:', data);
      if (translatedText && translatedText !== text) {
        console.log('✅ Translated (LibreTranslate):', translatedText);
        return translatedText;
      } else {
        console.log('⚠️ LibreTranslate returned same text or empty');
      }
    } else {
      console.log('❌ LibreTranslate failed with status:', response.status);
      const errorText = await response.text();
      console.log('❌ LibreTranslate error response:', errorText);
    }
  } catch (error) {
    console.log('💥 LibreTranslate error:', error);
  }

  return null;
};

// Translation function with LibreTranslate as primary, fallback to MyMemory and Lingva
const translateText = async (text: string): Promise<string> => {
  if (!text.trim()) return text;

  // Truncate text to stay under API limits
  const truncatedText = text.length > 5000 ? text.substring(0, 4997) + '...' : text;

  // Calculate delay based on consecutive failures (exponential backoff)
  const currentTime = Date.now();
  const timeSinceLastRequest = currentTime - lastRequestTime;
  const requiredDelay = Math.min(BASE_DELAY * Math.pow(2, consecutiveFailures), MAX_DELAY);
  const actualDelay = Math.max(0, requiredDelay - timeSinceLastRequest);

  if (actualDelay > 0) {
    console.log(`⏳ Rate limiting: waiting ${actualDelay}ms before next request...`);
    await new Promise(resolve => setTimeout(resolve, actualDelay));
  }

  try {
    lastRequestTime = Date.now();

    // Try LibreTranslate first (better quality than Lingva)
    console.log('🎯 Trying LibreTranslate API...');
    const libreResult = await translateWithLibre(truncatedText);
    if (libreResult !== null) {
      consecutiveFailures = 0; // Reset on success
      return libreResult;
    }

    // Fallback to MyMemory (good quality but rate limited)
    console.log('🔄 Trying MyMemory Translate API...');
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncatedText)}&langpair=en|es`, {
        method: 'GET',
      });

      if (response.status === 429) {
        consecutiveFailures++;
        console.log(`🚫 MyMemory rate limited (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}), trying Lingva...`);
      } else if (response.ok) {
        const data = await response.json();
        const translatedText = data.responseData?.translatedText;

        if (translatedText && translatedText !== truncatedText && !translatedText.includes('QUERY LENGTH LIMIT EXCEEDED')) {
          console.log('📝 Original:', truncatedText);
          console.log('✅ Translated (MyMemory):', translatedText);
          consecutiveFailures = 0; // Reset on success
          return translatedText;
        }
      }
    } catch (mymemoryError) {
      console.log('💥 MyMemory failed, trying Lingva...');
    }

    // Final fallback to Lingva (works but lower quality)
    console.log('🎯 Trying Lingva Translate API...');
    try {
      const lingvaResponse = await fetch(`https://lingva.ml/api/v1/en/es/${encodeURIComponent(truncatedText)}`, {
        method: 'GET',
      });

      if (lingvaResponse.ok) {
        const lingvaData = await lingvaResponse.json();
        const lingvaTranslated = lingvaData.translation;

        if (lingvaTranslated && lingvaTranslated !== truncatedText) {
          console.log('📝 Original:', truncatedText);
          console.log('✅ Translated (Lingva):', lingvaTranslated);
          consecutiveFailures = 0; // Reset on success
          return lingvaTranslated;
        }
      }
    } catch (lingvaError) {
      console.log('💥 All translation APIs failed');
      consecutiveFailures++;
    }

    // If all APIs fail, keep original text
    console.log('⚠️ All translation attempts failed, keeping original text');
    return text;

  } catch (error) {
    console.error('💥 Translation error:', error);
    console.log('⚠️ Keeping original text due to translation failure');
    consecutiveFailures++;
    return text;
  }
};

interface BulkImportProps {
  type: 'game' | 'product' | 'service';
  onCancel: () => void;
  onSuccess: () => void;
}

export const BulkImport: React.FC<BulkImportProps> = ({ type, onCancel, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getRequiredFields = () => {
    if (type === 'game') {
      return ['cover', 'name', 'size', 'year', 'platform', 'price', 'currency', 'description'];
    } else if (type === 'product') {
      return ['name', 'price', 'currency', 'description', 'image', 'category'];
    } else {
      return ['cover', 'name', 'price', 'currency', 'description', 'duration'];
    }
  };

  const getAllFields = () => {
    if (type === 'game') {
      return ['cover', 'name', 'size', 'year', 'platform', 'price', 'currency', 'description', 'status', 'genre'];
    } else if (type === 'product') {
      return ['name', 'price', 'currency', 'description', 'image', 'category'];
    } else {
      return ['cover', 'name', 'price', 'currency', 'description', 'duration'];
    }
  };

  const generateTemplate = () => {
    const fields = getAllFields();
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
        const validData = (results.data as Record<string, string>[]).filter(row => {
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
          setError(`Faltan campos requeridos: ${missingFields.join(', ')}. Por favor asegúrate de que tu CSV tenga todas las columnas requeridas. Campos opcionales: ${type === 'game' ? 'status, genre' : 'ninguno'}`);
          return;
        }

        setData(validData);
      },
    });
  };

  const processData = async (rawData: Record<string, string>[]) => {
    const processedRows = [];
    for (const row of rawData) {
      let description = row.description || '';

      // Attempt to translate description (assumes English input, translates to Spanish)
      if (description.trim()) {
        console.log('📝 Original description:', description);
        const translated = await translateText(description);
        description = translated;
      }

      const processedRow = processRow(row, description);
      processedRows.push(processedRow);
    }
    return processedRows;
  };

  const processRow = (row: Record<string, string>, translatedDescription: string) => {
    if (type === 'game') {
      // Validate platform
      const validPlatforms = ['PC Game', 'PlayStation 4', 'Nintendo Switch', 'PlayStation 3', 'Xbox 360', 'Xbox One', 'Xbox Series', 'Nintendo WiiU', 'Nintendo Wii', 'Nintendo 3DS', 'PlayStation 2', 'PlayStation Portable', 'PlayStation Vita'];
      if (!validPlatforms.includes(row.platform)) {
        throw new Error(`Plataforma inválida: "${row.platform}". Plataformas válidas: ${validPlatforms.join(', ')}`);
      }

      // Validate currency
      const validCurrencies = ['USD', 'CUP'];
      if (!validCurrencies.includes(row.currency)) {
        throw new Error(`Moneda inválida: "${row.currency}". Monedas válidas: ${validCurrencies.join(', ')}`);
      }

      // Validate status if provided
      const validStatuses = ['newly_added', 'updated', '', null, undefined];
      if (row.status && !validStatuses.includes(row.status)) {
        throw new Error(`Estado inválido: "${row.status}". Estados válidos: newly_added, updated (o dejar vacío)`);
      }

      // Validate genre if provided and platform is PC Game
      if (row.genre && row.platform === 'PC Game') {
        const validGenres = ['Action', 'Action RPG', 'Aventura Gráfica', 'Aventura-Acción', 'Beat Em-Up', 'Conducción', 'Estrategia', 'Fighting', 'Hack and Slash', 'Metroidvania', 'MMO', 'Musou', 'Plataformas', 'Rogelike', 'RPG', 'Shooter', 'Simulación', 'Sports', 'Survival', 'Survival Horror'];
        if (!validGenres.includes(row.genre)) {
          throw new Error(`Género inválido: "${row.genre}". Géneros válidos para PC Game: ${validGenres.join(', ')}`);
        }
      }

      return {
        cover: row.cover || '',
        name: row.name || '',
        size: row.size || '',
        year: parseInt(row.year) || new Date().getFullYear(),
        platform: row.platform || '',
        price: parseFloat(row.price) || 0,
        currency: row.currency || 'USD',
        description: translatedDescription,
        status: (row.status === 'newly_added' || row.status === 'updated') ? row.status : null,
        genre: (row.genre && row.platform === 'PC Game') ? row.genre : null,
        views: 0,
      };
    } else if (type === 'product') {
      // Validate currency
      const validCurrencies = ['USD', 'CUP'];
      if (!validCurrencies.includes(row.currency)) {
        throw new Error(`Moneda inválida: "${row.currency}". Monedas válidas: ${validCurrencies.join(', ')}`);
      }

      // Validate category
      const validCategories = ['electronics', 'accessory'];
      if (!validCategories.includes(row.category)) {
        throw new Error(`Categoría inválida: "${row.category}". Categorías válidas: ${validCategories.join(', ')}`);
      }

      return {
        name: row.name || '',
        price: parseFloat(row.price) || 0,
        currency: row.currency || 'USD',
        description: translatedDescription,
        image: row.image || '',
        category: row.category || 'electronics',
      };
    } else {
      // Validate currency
      const validCurrencies = ['USD', 'CUP'];
      if (!validCurrencies.includes(row.currency)) {
        throw new Error(`Moneda inválida: "${row.currency}". Monedas válidas: ${validCurrencies.join(', ')}`);
      }

      return {
        name: row.name || '',
        price: parseFloat(row.price) || 0,
        currency: row.currency || 'USD',
        description: translatedDescription,
        cover: row.cover || '',
        duration: row.duration || '',
      };
    }
  };

  const handleImport = async () => {
    if (!data.length) return;

    setLoading(true);
    setError('');

    try {
      const processedData = await processData(data);
      const tableName = type === 'game' ? 'games' : type === 'product' ? 'products' : 'services';

      const { error } = await supabase
        .from(tableName)
        .insert(processedData);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error de base de datos: ${error.message}. Código: ${error.code}. Detalles: ${error.details || 'No disponible'}`);
      }

      setSuccess(`Successfully imported ${processedData.length} ${type}s!`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido durante la importación');
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
          Descarga el archivo plantilla y llénalo con tus datos de {type}. Campos requeridos: {getRequiredFields().join(', ')}{type === 'game' ? '. Campos opcionales: status, genre (solo para PC Game)' : ''}
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
                  {getAllFields().map((field) => (
                    <TableCell key={field}>{field}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {getAllFields().map((field) => (
                      <TableCell key={field}>{row[field] || 'N/A'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {data.length > 10 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mostrando las primeras 10 filas de {data.length} filas totales
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
          Cancelar
        </Button>
        {data.length > 0 && (
          <Button
            variant="contained"
            onClick={handleImport}
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            {loading ? 'Importando...' : `Importar ${data.length} Elementos`}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

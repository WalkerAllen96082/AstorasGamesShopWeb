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
const MAX_CONSECUTIVE_FAILURES = 3; // Reduced to be more aggressive
const BASE_DELAY = 30000; // Increased to 30 seconds base delay
const MAX_DELAY = 60000; // Maximum 60 second delay

// LibreTranslate API function (free, open source, better quality than Lingva)
const translateWithLibre = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch('https://translate.argosopentech.com/translate', {
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

    if (response.ok) {
      const data = await response.json();
      const translatedText = data.translatedText;
      if (translatedText && translatedText !== text) {
        console.log('Translated (LibreTranslate):', translatedText);
        return translatedText;
      }
    }
  } catch (error) {
    console.log('LibreTranslate failed:', error);
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
    console.log(`Rate limiting: waiting ${actualDelay}ms before next request...`);
    await new Promise(resolve => setTimeout(resolve, actualDelay));
  }

  try {
    lastRequestTime = Date.now();

    // Try LibreTranslate first (better quality than Lingva)
    console.log('Trying LibreTranslate API...');
    const libreResult = await translateWithLibre(truncatedText);
    if (libreResult !== null) {
      consecutiveFailures = 0; // Reset on success
      return libreResult;
    }

    // Fallback to MyMemory (good quality but rate limited)
    console.log('Trying MyMemory Translate API...');
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncatedText)}&langpair=en|es`, {
        method: 'GET',
      });

      if (response.status === 429) {
        consecutiveFailures++;
        console.log(`MyMemory rate limited (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}), trying Lingva...`);
      } else if (response.ok) {
        const data = await response.json();
        const translatedText = data.responseData?.translatedText;

        if (translatedText && translatedText !== truncatedText && !translatedText.includes('QUERY LENGTH LIMIT EXCEEDED')) {
          console.log('Original:', truncatedText);
          console.log('Translated (MyMemory):', translatedText);
          consecutiveFailures = 0; // Reset on success
          return translatedText;
        }
      }
    } catch (mymemoryError) {
      console.log('MyMemory failed, trying Lingva...');
    }

    // Final fallback to Lingva (works but lower quality)
    console.log('Trying Lingva Translate API...');
    try {
      const lingvaResponse = await fetch(`https://lingva.ml/api/v1/en/es/${encodeURIComponent(truncatedText)}`, {
        method: 'GET',
      });

      if (lingvaResponse.ok) {
        const lingvaData = await lingvaResponse.json();
        const lingvaTranslated = lingvaData.translation;

        if (lingvaTranslated && lingvaTranslated !== truncatedText) {
          console.log('Original:', truncatedText);
          console.log('Translated (Lingva):', lingvaTranslated);
          consecutiveFailures = 0; // Reset on success
          return lingvaTranslated;
        }
      }
    } catch (lingvaError) {
      console.log('All translation APIs failed');
      consecutiveFailures++;
    }

    // If all APIs fail, keep original text
    console.log('All translation attempts failed, keeping original text');
    return text;

  } catch (error) {
    console.error('Translation error:', error);
    console.log('Keeping original text due to translation failure');
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
        console.log('Original description:', description);
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
        genre: (row.genre && row.platform === 'PC Game

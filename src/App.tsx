import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { SearchPage } from './pages/SearchPage';
import { GamesPage } from './pages/GamesPage';
import { ProductsPage } from './pages/ProductsPage';
import { ServicesPage } from './pages/ServicesPage';
import { CartPage } from './pages/CartPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/games/:id" element={<GameDetailPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
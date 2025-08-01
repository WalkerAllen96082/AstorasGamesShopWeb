export interface Game {
  id: string;
  cover: string;
  name: string;
  size: string;
  year: number;
  platform: Platform;
  price: number;
  currency: 'CUP' | 'USD';
  description: string;
  status?: 'newly_added' | 'updated' | null;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: 'CUP' | 'USD';
  description: string;
  image?: string;
  category: 'electronics' | 'accessory';
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  cover: string;
  name: string;
  price: number;
  currency: 'CUP' | 'USD';
  description: string;
  duration?: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  content: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type Platform = 
  | 'PC Game'
  | 'PlayStation 4'
  | 'Nintendo Switch'
  | 'PlayStation 3'
  | 'Xbox 360'
  | 'Xbox One'
  | 'Xbox Series'
  | 'Nintendo WiiU'
  | 'Nintendo Wii'
  | 'Nintendo 3DS'
  | 'PlayStation 2'
  | 'PlayStation Portable';

export type GameGenre = 
  | 'Action'
  | 'Action RPG'
  | 'Aventura Gráfica'
  | 'Aventura-Acción'
  | 'Beat Em-Up'
  | 'Conducción'
  | 'Estrategia'
  | 'Fighting'
  | 'Hack and Slash'
  | 'Metroidvania'
  | 'MMO'
  | 'Musou'
  | 'Plataformas'
  | 'Rogelike'
  | 'RPG'
  | 'Shooter'
  | 'Simulación'
  | 'Sports'
  | 'Survival'
  | 'Survival Horror';

export interface CartItem {
  id: string;
  type: 'game' | 'product' | 'service';
  item: Game | Product | Service;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}
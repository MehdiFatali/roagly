import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  shortDescription?: string;
  category: 'Fitness Clothes' | 'Protein' | 'Creatine' | 'Accessories';
  imageUrls: string[];
  sizes?: string[];
  stock?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CartItem extends Product {
  selectedSize?: string;
  quantity: number;
}

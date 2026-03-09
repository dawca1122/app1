import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InventoryData {
  productName: string;
  ean: string;
  amount: number;
  rawPhotos: string[];
  proPhotos: string[];
  weeeNumber?: string;
}

export interface TokenResponse {
  tokens: Record<string, string>;
}

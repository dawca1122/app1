import React, { useState, useEffect } from 'react';
import { getRecentInventory } from '../services/googleService';
import { Loader2, Package, ExternalLink } from 'lucide-react';

export const InventoryList = ({ t }: { t: any }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecentInventory()
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel">
        <Loader2 className="w-8 h-8 animate-spin text-pro-blue mb-4" />
        <p className="text-white/50 text-sm uppercase tracking-widest">Ładowanie danych z arkusza...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-red-500 font-bold uppercase tracking-widest mb-2">Błąd połączenia</p>
        <p className="text-white/50 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Ostatnie Skanowania</h2>
        <span className="px-3 py-1 rounded-full bg-pro-blue/20 text-pro-blue text-xs font-bold">Kierownik Magazynu Ebay</span>
      </div>
      
      <div className="grid gap-4">
        {items.map((item, i) => (
          <div key={i} className="glass-panel p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pro-blue/20 flex items-center justify-center border border-pro-blue/30">
                <Package className="w-6 h-6 text-pro-blue" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">{item.productName || 'Nieznany produkt'}</p>
                <div className="flex gap-4 mt-1">
                  <p className="text-xs text-white/50 font-mono bg-black/30 px-2 py-0.5 rounded">EAN: {item.ean}</p>
                  <p className="text-xs text-white/50 font-mono bg-black/30 px-2 py-0.5 rounded">Ilość: {item.amount}</p>
                  {item.weee && item.weee !== 'N/A' && (
                    <p className="text-xs text-green-400/80 font-mono bg-green-400/10 px-2 py-0.5 rounded">WEEE: {item.weee}</p>
                  )}
                </div>
              </div>
            </div>
            {item.folderUrl && (
              <a 
                href={item.folderUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="p-3 rounded-full bg-white/5 hover:bg-pro-blue/20 text-white/60 hover:text-pro-blue transition-colors border border-white/10 hover:border-pro-blue/30"
                title="Otwórz folder Google Drive"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center p-12 glass-panel">
            <p className="text-white/50 uppercase tracking-widest">Brak danych w arkuszu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

// API Response type approximation
type InitData = {
  settings: any;
  categories: any[];
  blocks: any[];
  ads: any[];
};

type AppContextType = {
  initData: InitData | null;
  loading: boolean;
  marketData: any;
  weatherData: any;
};

const AppContext = createContext<AppContextType>({
  initData: null,
  loading: true,
  marketData: null,
  weatherData: null,
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [initData, setInitData] = useState<InitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [initRes, marketRes, weatherRes] = await Promise.all([
           fetch('/api/init'),
           fetch('/api/market-data'),
           fetch('/api/weather')
        ]);
        
        if(initRes.ok) {
           const { data } = await initRes.json();
           setInitData(data);
        }
        if(marketRes.ok) {
           const { data } = await marketRes.json();
           setMarketData(data);
        }
        if(weatherRes.ok) {
           const { data } = await weatherRes.json();
           setWeatherData(data);
        }
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  return (
    <AppContext.Provider value={{ initData, loading, marketData, weatherData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAppContext } from "../AppContext";

export default function FinanceBar() {
  const { marketData } = useAppContext();
  const date = format(new Date(), "d MMMM yyyy EEEE", { locale: tr });
  
  if (!marketData) return null; // Admin disabled the bar or it's loading

  const buildDiff = (change: string) => {
    const isUp = change.includes('+');
    return { diff: change, isUp };
  };

  const data = [
    { label: "BIST 100", value: marketData.bist100?.value || '-', ...buildDiff(marketData.bist100?.change || '') },
    { label: "DOLAR", value: marketData.usd?.value || '-', ...buildDiff(marketData.usd?.change || '') },
    { label: "EURO", value: marketData.eur?.value || '-', ...buildDiff(marketData.eur?.change || '') },
    { label: "ALTIN", value: marketData.gold?.value || '-', ...buildDiff(marketData.gold?.change || '') },
  ];

  return (
    <div className="bg-gray-100 border-b border-gray-200 text-xs text-gray-700 py-1.5 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="font-medium text-gray-600">
          {date}
        </div>
        <div className="flex space-x-6">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-1.5">
              <span className="font-semibold text-gray-800">{item.label}</span>
              <span>{item.value}</span>
              <span className={`font-bold flex items-center ${item.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {item.isUp ? (
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                ) : (
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                )}
                {item.diff}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

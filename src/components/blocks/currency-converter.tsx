import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { ArrowLeftRight } from 'lucide-react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number>(0);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
  
  const intervalRef = useRef<number | null>(null);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US');
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        const newAmount = Math.floor(Math.random() * 1000000) + 1;
        setAmount(newAmount);
      }, 50);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        const rates = response.data.rates;
        
        if (rates[toCurrency]) {
          const convertedAmount = amount * rates[toCurrency];
          setResult(convertedAmount);
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };

    if (fromCurrency && toCurrency) {
      fetchRates();
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  const handleStopGame = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-[500px] w-full max-w-2xl mx-auto p-8 bg-[#000000] border border-[#7C7C7C]/20 text-white rounded-3xl shadow-2xl">
      <div className="space-y-8">
        {/* Amount Display */}
        <div className="text-center relative">
          <div className="text-7xl font-bold font-mono tracking-wider mb-2 
                        bg-gradient-to-r from-[#7C7C7C] via-[#7C7C7C] to-[#D64933] 
                        bg-clip-text text-transparent
                        transition-all duration-200">
            {formatAmount(amount)}
          </div>
        </div>

        {/* Control Button */}
        <div className="flex justify-center">
          <Button
            onClick={isPlaying ? handleStopGame : handleStartGame}
            className={`w-40 h-14 text-lg font-medium rounded-full transition-all duration-300
                      ${isPlaying 
                        ? 'bg-[#D64933] hover:bg-[#D64933]/90 text-white' 
                        : 'bg-[#7C7C7C] hover:bg-[#7C7C7C]/90 text-white'}`}
          >
            {isPlaying ? "STOP" : "START"}
          </Button>
        </div>
        
        {/* Currency Selectors */}
        <div className="grid grid-cols-7 gap-4 items-center mt-8">
          <div className="col-span-3">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-14 bg-[#7C7C7C]/10 border-[#7C7C7C]/20 text-white">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent className="bg-[#000000] border-[#7C7C7C]/20">
                {popularCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}
                            className="text-white hover:bg-[#7C7C7C]/10">
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapCurrencies}
              className="w-14 h-14 rounded-full bg-[#7C7C7C]/10 hover:bg-[#7C7C7C]/20 border border-[#7C7C7C]/20"
            >
              <ArrowLeftRight className="h-6 w-6 text-[#D64933]" />
            </Button>
          </div>
          
          <div className="col-span-3">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-14 bg-[#7C7C7C]/10 border-[#7C7C7C]/20 text-white">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent className="bg-[#000000] border-[#7C7C7C]/20">
                {popularCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}
                            className="text-white hover:bg-[#7C7C7C]/10">
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversion Result */}
        {result !== null && (
          <div className="text-center space-y-2 mt-8 py-6 border-t border-[#7C7C7C]/20">
            <div className="text-4xl font-light text-[#D64933]">
              {result.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} {toCurrency}
            </div>
            <div className="text-sm text-[#7C7C7C]">
              1 {fromCurrency} = {(result / amount).toFixed(4)} {toCurrency}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
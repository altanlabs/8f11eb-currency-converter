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
      }, 50); // Update every 50ms for fast changes
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
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 relative overflow-hidden">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold mb-6">{formatAmount(amount)}</div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={isPlaying ? handleStopGame : handleStartGame}
            variant={isPlaying ? "destructive" : "default"}
            className="w-32"
          >
            {isPlaying ? "Stop" : "Start"}
          </Button>
        </div>
        
        <div className="grid grid-cols-5 gap-4 mt-6 items-end">
          <div className="col-span-2 space-y-2">
            <label className="text-sm text-muted-foreground">From</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="From Currency" />
              </SelectTrigger>
              <SelectContent>
                {popularCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center items-end h-[42px]">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapCurrencies}
              className="h-[42px]"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="col-span-2 space-y-2">
            <label className="text-sm text-muted-foreground">To</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="To Currency" />
              </SelectTrigger>
              <SelectContent>
                {popularCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="text-center space-y-2">
          <div className="text-3xl font-light">
            {result.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} {toCurrency}
          </div>
          <div className="text-sm text-muted-foreground">
            1 {fromCurrency} = {(result / amount).toFixed(4)} {toCurrency}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CurrencyConverter;
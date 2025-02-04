import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number>(0);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('slow');

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
  
  const x = useMotionValue(0);
  const springConfig = { damping: 10, stiffness: 100 };
  const springX = useSpring(x, springConfig);
  
  const bounceRef = useRef<number>(0);
  const lastDirectionRef = useRef<number>(1);
  const speedRef = useRef<number>(0);
  const baseSpeedRef = useRef<number>(1);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getSpeedMultiplier = () => {
    switch (speed) {
      case 'slow': return 1;
      case 'medium': return 100;
      case 'fast': return 10000;
      default: return 1;
    }
  };

  const formatAmount = (num: number) => {
    if (num >= 1000000) {
      return num.toLocaleString('en-US');
    }
    return num.toString();
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const multiplier = getSpeedMultiplier();
      speedRef.current += lastDirectionRef.current * (0.5 * baseSpeedRef.current);
      bounceRef.current += Math.random() * 2 - 1;
      bounceRef.current *= 0.95;
      x.set(x.get() + speedRef.current + bounceRef.current);
      
      if (x.get() > 100 || x.get() < 0) {
        lastDirectionRef.current *= -1;
        speedRef.current = 0;
        if (Math.random() > 0.7) lastDirectionRef.current *= -1;
        baseSpeedRef.current = Math.min(baseSpeedRef.current + 0.2, 5);
      }
      
      const newAmount = Math.abs(Math.round(x.get() * multiplier));
      setAmount(Math.min(newAmount, 1000000));
    }, 16);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

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
    speedRef.current = 0;
    bounceRef.current = 0;
    baseSpeedRef.current = 1;
  };

  const handleStopGame = () => {
    setIsPlaying(false);
  };

  const cycleSpeed = () => {
    const speeds: Array<'slow' | 'medium' | 'fast'> = ['slow', 'medium', 'fast'];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 relative overflow-hidden">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{formatAmount(amount)}</div>
          <div className="text-sm text-muted-foreground">
            Speed: {speed.charAt(0).toUpperCase() + speed.slice(1)}
          </div>
        </div>

        <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-2 h-full bg-primary rounded-full"
            style={{ x: springX }}
          />
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={isPlaying ? handleStopGame : handleStartGame}
            variant={isPlaying ? "destructive" : "default"}
            className="w-32"
          >
            {isPlaying ? "Stop" : "Start"}
          </Button>
          <Button
            onClick={cycleSpeed}
            variant="outline"
            className="w-32"
            disabled={isPlaying}
          >
            Change Speed
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
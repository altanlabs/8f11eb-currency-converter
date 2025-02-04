import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

type GameMode = 'bounce' | 'falling' | 'spinning' | 'racing';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetNumber, setTargetNumber] = useState(50);
  const [gameMessage, setGameMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('bounce');

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotation = useMotionValue(0);
  const springConfig = { damping: 10, stiffness: 100 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  const bounceRef = useRef<number>(0);
  const lastDirectionRef = useRef<number>(1);
  const speedRef = useRef<number>(0);
  const racePositionsRef = useRef<number[]>([0, 20, 40, 60]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const nextGameMode = () => {
    const modes: GameMode[] = ['bounce', 'falling', 'spinning', 'racing'];
    const currentIndex = modes.indexOf(gameMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setGameMode(modes[nextIndex]);
    setIsPlaying(false);
    resetGame();
  };

  const resetGame = () => {
    x.set(0);
    y.set(0);
    rotation.set(0);
    speedRef.current = 0;
    bounceRef.current = 0;
    racePositionsRef.current = [0, 20, 40, 60];
  };

  useEffect(() => {
    if (!isPlaying) return;

    let interval: NodeJS.Timeout;

    switch (gameMode) {
      case 'bounce':
        interval = setInterval(() => {
          speedRef.current += lastDirectionRef.current * 0.5;
          bounceRef.current += Math.random() * 2 - 1;
          bounceRef.current *= 0.95;
          x.set(x.get() + speedRef.current + bounceRef.current);
          
          if (x.get() > 100 || x.get() < 0) {
            lastDirectionRef.current *= -1;
            speedRef.current = 0;
            if (Math.random() > 0.7) lastDirectionRef.current *= -1;
          }
          
          setAmount(Math.abs(Math.round(x.get())));
        }, 16);
        break;

      case 'falling':
        interval = setInterval(() => {
          y.set(y.get() + speedRef.current);
          speedRef.current += 0.2;
          
          if (y.get() > 100) {
            y.set(0);
            speedRef.current = 0;
          }
          
          setAmount(Math.abs(Math.round(y.get())));
        }, 16);
        break;

      case 'spinning':
        interval = setInterval(() => {
          rotation.set(rotation.get() + speedRef.current);
          speedRef.current += 0.5;
          
          const normalizedRotation = (rotation.get() % 360 + 360) % 360;
          setAmount(Math.round((normalizedRotation / 360) * 100));
        }, 16);
        break;

      case 'racing':
        interval = setInterval(() => {
          racePositionsRef.current = racePositionsRef.current.map(pos => {
            const newPos = pos + Math.random() * 3;
            return newPos > 100 ? 0 : newPos;
          });
          setAmount(Math.round(racePositionsRef.current[0]));
        }, 16);
        break;
    }

    return () => clearInterval(interval);
  }, [isPlaying, gameMode]);

  useEffect(() => {
    if (amount === targetNumber) {
      setIsPlaying(false);
      setShowCelebration(true);
      setGameMessage("🎉 Perfect! You got it!");
      
      setTimeout(() => {
        setShowCelebration(false);
        setTargetNumber(Math.floor(Math.random() * 100));
      }, 2000);
    }
  }, [amount, targetNumber]);

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

    if (amount && fromCurrency && toCurrency) {
      fetchRates();
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleStartGame = () => {
    setIsPlaying(true);
    setGameMessage(`Try to hit ${targetNumber}!`);
    resetGame();
  };

  const handleStopGame = () => {
    setIsPlaying(false);
    const difference = Math.abs(amount - targetNumber);
    setGameMessage(`You were off by ${difference}! Try again!`);
  };

  const renderGameInterface = () => {
    switch (gameMode) {
      case 'bounce':
        return (
          <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-2 h-full bg-primary rounded-full"
              style={{ x: springX }}
            />
          </div>
        );

      case 'falling':
        return (
          <div className="relative h-32 bg-secondary rounded-lg overflow-hidden">
            <motion.div
              className="absolute left-1/2 w-4 h-4 bg-primary rounded-full"
              style={{ y: springY }}
            />
          </div>
        );

      case 'spinning':
        return (
          <div className="relative h-32 w-32 mx-auto">
            <motion.div
              className="absolute top-0 left-1/2 w-1 h-16 bg-primary origin-bottom"
              style={{ rotate: rotation }}
            />
          </div>
        );

      case 'racing':
        return (
          <div className="relative h-32 bg-secondary rounded-lg overflow-hidden">
            {racePositionsRef.current.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute top-0 w-4 h-4 bg-primary rounded-full"
                style={{ 
                  x: `${pos}%`,
                  y: `${(i + 1) * 20}%`,
                  backgroundColor: i === 0 ? 'var(--primary)' : 'var(--primary-foreground)'
                }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 relative overflow-hidden">
      {showCelebration && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Game Mode:</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={nextGameMode}
          >
            {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Target: {targetNumber}</div>
          <div className="text-4xl font-bold">{amount}</div>
          <div className="text-sm text-muted-foreground">{gameMessage}</div>
        </div>

        {renderGameInterface()}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={isPlaying ? handleStopGame : handleStartGame}
            variant={isPlaying ? "destructive" : "default"}
            className="w-32"
          >
            {isPlaying ? "Stop" : "Start"}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 relative">
          <div className="space-y-2">
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

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapCurrencies}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          
          <div className="space-y-2">
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
            {result.toFixed(2)} {toCurrency}
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
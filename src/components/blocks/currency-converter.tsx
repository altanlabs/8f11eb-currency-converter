import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { ArrowLeftRight } from 'lucide-react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number>(0);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [piInput, setPiInput] = useState('');
  const [gameMessage, setGameMessage] = useState('');

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
  const piDigits = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const checkPiInput = () => {
    let correctDigits = 0;
    for (let i = 0; i < piInput.length; i++) {
      if (piInput[i] === piDigits[i]) {
        correctDigits++;
      } else {
        break;
      }
    }
    setAmount(correctDigits);
    setGameMessage(`You got ${correctDigits} digits right!`);
  };

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

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6 relative overflow-hidden">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Enter digits of π (Pi):</div>
          <Input
            type="text"
            value={piInput}
            onChange={(e) => setPiInput(e.target.value)}
            placeholder="3.14159..."
            className="text-2xl font-light h-16 text-center"
          />
          <Button onClick={checkPiInput} className="mt-2">Check</Button>
          <div className="text-sm text-muted-foreground">{gameMessage}</div>
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
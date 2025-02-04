import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        const rates = response.data.rates;
        setCurrencies(Object.keys(rates));
        
        if (rates[toCurrency]) {
          const convertedAmount = parseFloat(amount) * rates[toCurrency];
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
    <Card className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="text-2xl font-light h-16 text-center"
        />
        
        <div className="grid grid-cols-2 gap-4">
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
            1 {fromCurrency} = {(result / parseFloat(amount)).toFixed(4)} {toCurrency}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CurrencyConverter;
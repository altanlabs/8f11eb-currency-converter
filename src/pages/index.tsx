import CurrencyConverter from '@/components/blocks/currency-converter';

export default function IndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 bg-background">
      <h1 className="text-4xl md:text-6xl font-bold mb-12 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Currency Converter
      </h1>
      
      <div className="w-full max-w-md">
        <CurrencyConverter />
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground text-center">
        Real-time exchange rates powered by Exchange Rate API
      </p>
    </div>
  );
}
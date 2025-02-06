import CurrencyConverter from '@/components/blocks/currency-converter';

export default function IndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#000000]">
      <h1 className="text-5xl md:text-6xl font-bold mb-12 text-center bg-gradient-to-r from-[#7C7C7C] to-[#D64933] bg-clip-text text-transparent">
        Currency Converter
      </h1>
      <div className="w-full">
        <CurrencyConverter />
      </div>
    </div>
  );
}
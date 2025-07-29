import { TaxCalculatorWizard } from '@/components/tax-calculator-wizard';

export default function Home() {
  return (
    <main className="min-h-screen py-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TaxCalculatorWizard />
    </main>
  );
}

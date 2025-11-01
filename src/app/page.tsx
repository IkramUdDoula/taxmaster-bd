import { TaxCalculatorWizard } from '@/components/tax-calculator-wizard';

export default function Home() {
  return (
    <main className="min-h-screen py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="relative z-10">
        <TaxCalculatorWizard />
      </div>
    </main>
  );
}

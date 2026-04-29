"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateBdTax,
  type TaxCalculationResult,
  type TaxpayerCategory,
  formatCurrency,
} from "@/lib/tax-helpers";
import {
  Calculator,
  Wallet,
  TrendingDown,
  Calendar,
  ChevronDown,
  PiggyBank,
  Info,
  BarChart3,
} from "lucide-react";

export function SinglePageTaxCalculator() {
  // Form state
  const [incomeYear, setIncomeYear] = useState("2025-2026");
  const [taxpayerCategory, setTaxpayerCategory] = useState<TaxpayerCategory>("men");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [includeInvestments, setIncludeInvestments] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");

  // UI state
  const [showComparisonTable, setShowComparisonTable] = useState(false);

  // Results state
  const [taxResults, setTaxResults] = useState<TaxCalculationResult | null>(null);
  
  // Refs for animations
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-calculate investment amount when toggle is switched on
  useEffect(() => {
    if (includeInvestments) {
      const salaryNum = parseFloat(monthlySalary);
      const bonusesNum = parseFloat(bonuses) || 0;
      
      if (!isNaN(salaryNum) && salaryNum > 0) {
        const annualIncomeForInvestmentCalc = (salaryNum * 12) + bonusesNum;
        
        const STANDARD_EXEMPTION_INCOME_FRACTION = 1 / 3;
        const STANDARD_EXEMPTION_CAP: Record<string, number> = {
          "2024-2025": 450000,
          "2025-2026": 500000,
        };
        const MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME = 0.20;
        const MAX_INVESTMENT_ALLOWANCE_ABSOLUTE = 10000000;

        const exemptionBasedOnIncome = annualIncomeForInvestmentCalc * STANDARD_EXEMPTION_INCOME_FRACTION;
        const cap = STANDARD_EXEMPTION_CAP[incomeYear] ?? 450000;
        const standardExemptionApplied = Math.min(cap, exemptionBasedOnIncome);
        const preliminaryTaxableIncome = Math.max(0, annualIncomeForInvestmentCalc - standardExemptionApplied);

        if (preliminaryTaxableIncome > 0) {
          const maxInvestmentByIncome = preliminaryTaxableIncome * MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME;
          const preliminaryAllowableInvestment = Math.min(maxInvestmentByIncome, MAX_INVESTMENT_ALLOWANCE_ABSOLUTE);
          setInvestmentAmount(Math.ceil(preliminaryAllowableInvestment).toFixed(0));
        } else {
          setInvestmentAmount("0");
        }
      } else {
        setInvestmentAmount("0");
      }
    }
  }, [includeInvestments, monthlySalary, bonuses, incomeYear]);

  // Real-time calculation effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const calculateTax = () => {
        const salaryNum = parseFloat(monthlySalary) || 0;
        const bonusesNum = parseFloat(bonuses) || 0;

        // Only calculate if we have valid income
        if (salaryNum > 0) {
          const investmentNum = includeInvestments ? (parseFloat(investmentAmount) || 0) : 0;

          try {
            const results = calculateBdTax(
              salaryNum,
              bonusesNum,
              includeInvestments,
              investmentNum,
              incomeYear,
              taxpayerCategory
            );
            setTaxResults(results);
          } catch (e) {
            setTaxResults(null);
          }
        } else {
          setTaxResults(null);
        }
      };

      calculateTax();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    monthlySalary,
    bonuses,
    includeInvestments,
    investmentAmount,
    incomeYear,
    taxpayerCategory,
  ]);

  // Generate comparison table data
  const generateComparisonData = () => {
    if (!taxResults) return [];

    const currentMonthlySalary = parseFloat(monthlySalary) || 0;
    const minMonthlySalary = Math.max(0, currentMonthlySalary / 2);
    const maxMonthlySalary = currentMonthlySalary * 2;
    const monthlyInterval = 5000;

    // Check if user has bonuses
    const userBonuses = parseFloat(bonuses) || 0;
    const hasBonuses = userBonuses > 0;

    const comparisonData = [];
    
    for (let monthlySalary = minMonthlySalary; monthlySalary <= maxMonthlySalary; monthlySalary += monthlyInterval) {
      const investmentNum = includeInvestments ? (parseFloat(investmentAmount) || 0) : 0;
      
      // Calculate proportional bonus based on the comparison salary
      const proportionalBonus = hasBonuses ? (monthlySalary / currentMonthlySalary) * userBonuses : 0;
      
      try {
        const result = calculateBdTax(
          monthlySalary,
          proportionalBonus,
          includeInvestments,
          investmentNum,
          incomeYear,
          taxpayerCategory
        );

        // Calculate monthly take-home without bonus (only from monthly salary)
        const annualSalaryOnly = monthlySalary * 12;
        const monthlyTakeHomeWithoutBonus = (annualSalaryOnly - result.finalTaxDue) / 12;

        comparisonData.push({
          monthlySalary: monthlySalary,
          bonus: proportionalBonus,
          totalMonthlyIncome: (monthlySalary * 12 + proportionalBonus) / 12,
          taxDue: result.finalTaxDue,
          takeHome: result.netAnnualIncome,
          monthlyTakeHome: monthlyTakeHomeWithoutBonus, // Monthly take-home without bonus
          effectiveRate: (result.finalTaxDue / result.totalAnnualIncome) * 100,
          monthlyTax: result.monthlyTaxDeduction,
          isCurrentIncome: Math.abs(monthlySalary - currentMonthlySalary) < monthlyInterval / 2,
        });
      } catch (e) {
        // Skip invalid calculations
      }
    }

    return comparisonData;
  };

  const comparisonData = generateComparisonData();
  const hasBonusesInTable = parseFloat(bonuses) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-6 lg:px-12 xl:px-16 py-8 md:py-12">
        {/* Hero Section - Compact */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-md">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-black tracking-tight">
              Bangladesh Tax Calculator
            </h1>
          </div>
        </div>

        {/* Four Column Layout - Always Visible */}
        <div className="grid gap-6 lg:grid-cols-4 animate-slide-in">
          {/* Left Column - Tax Year & Category */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
              {/* Tax Year Selection */}
              <div className="mb-6">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">
                  Tax Year
                </Label>
                <div className="space-y-2">
                  {["2024-2025", "2025-2026"].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setIncomeYear(year)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium smooth-transition ${
                        incomeYear === year
                          ? "bg-black text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Taxpayer Category Selection */}
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">
                  Category
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "men", label: "Men" },
                    { value: "women", label: "Women" },
                    { value: "disabled", label: "Disabled" },
                    { value: "freedom_fighter", label: "Freedom Fighter" },
                  ].map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setTaxpayerCategory(category.value as TaxpayerCategory)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium smooth-transition ${
                        taxpayerCategory === category.value
                          ? "bg-black text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Input Section */}
          <div>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-200">

            {/* Income Inputs */}
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <Label htmlFor="monthlySalary" className="text-sm font-medium text-gray-600 text-center block">
                  Monthly Gross Salary
                </Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-light text-gray-400">৳</span>
                  <Input
                    id="monthlySalary"
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="50,000"
                    className="h-20 text-3xl md:text-4xl font-light text-center border-0 border-b-2 border-gray-200 focus:border-black bg-transparent rounded-none px-4 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="bonuses" className="text-sm font-medium text-gray-600 text-center block">
                  Annual Bonuses (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-light text-gray-400">৳</span>
                  <Input
                    id="bonuses"
                    type="number"
                    value={bonuses}
                    onChange={(e) => setBonuses(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="100,000"
                    className="h-16 text-xl font-light text-center border-0 border-b border-gray-200 focus:border-black bg-transparent rounded-none px-4 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Investment Toggle - Inline */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl smooth-transition hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="font-medium text-black cursor-pointer">Include Investments</Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Get 15% tax rebate
                    </p>
                  </div>
                </div>
                <Switch
                  checked={includeInvestments}
                  onCheckedChange={setIncludeInvestments}
                />
              </div>

              {includeInvestments && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <Label htmlFor="investmentAmount" className="text-sm font-medium text-gray-600 text-center block">
                    Investment Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-light text-gray-400">৳</span>
                    <Input
                      id="investmentAmount"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="200,000"
                      className="h-16 text-xl font-light text-center border-0 border-b border-gray-200 focus:border-black bg-transparent rounded-none px-4 focus-visible:ring-0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Max: 20% of taxable income or ৳1 crore
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Column 3 - Key Metrics & Breakdown */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium text-black">Key Metrics</h3>
              </div>

              {taxResults ? (
                <>
                  {/* Key Metrics - Compact */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Take-Home (Monthly)</span>
                      </div>
                      <p className="text-xl font-light text-black">
                        ৳{((taxResults.monthlyGrossSalary - taxResults.monthlyTaxDeduction) / 1000).toFixed(1)}k
                      </p>
                    </div>

                    <div className="bg-black rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calculator className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400 font-medium">Tax Due (Monthly)</span>
                      </div>
                      <p className="text-xl font-light text-white">
                        ৳{(taxResults.monthlyTaxDeduction / 1000).toFixed(1)}k
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Eff. Rate</span>
                      </div>
                      <p className="text-xl font-light text-black">
                        {((taxResults.finalTaxDue / taxResults.totalAnnualIncome) * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Annual Tax</span>
                      </div>
                      <p className="text-xl font-light text-black">
                        ৳{(taxResults.finalTaxDue / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>

                  {/* Breakdown - Always Expanded */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Annual Income</span>
                      <span className="text-xs font-medium text-black">
                        {formatCurrency(taxResults.totalAnnualIncome)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Exemption</span>
                      <span className="text-xs font-medium text-gray-400">
                        -{formatCurrency(taxResults.standardExemptionApplied)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Taxable</span>
                      <span className="text-xs font-medium text-black">
                        {formatCurrency(taxResults.taxableIncome)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-gray-600">Gross Tax</span>
                      <span className="text-xs font-medium text-black">
                        {formatCurrency(taxResults.grossTax)}
                      </span>
                    </div>

                    {taxResults.investmentAmountConsidered > 0 && (
                      <>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs text-gray-600">Investment</span>
                          <span className="text-xs font-medium text-black">
                            {formatCurrency(taxResults.investmentAmountConsidered)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs text-gray-600">Rebate (15%)</span>
                          <span className="text-xs font-medium text-green-600">
                            -{formatCurrency(taxResults.taxRebate)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center py-3 bg-black rounded-lg px-3 mt-2">
                      <span className="text-white text-xs font-semibold">Net Tax</span>
                      <span className="font-bold text-white text-sm">
                        {formatCurrency(taxResults.finalTaxDue)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Enter income to see metrics</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 4 - Tax Slabs */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium text-black">Tax Slabs</h3>
              </div>

              {taxResults && taxResults.taxSlabBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {taxResults.taxSlabBreakdown.map((slab, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-black">
                          {slab.slabDescription}
                        </span>
                        <span className="text-xs font-semibold text-gray-600">
                          {slab.taxRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          ৳{(slab.taxableAmountInSlab / 1000).toFixed(0)}k
                        </span>
                        <span className="text-xs font-semibold text-black">
                          {formatCurrency(slab.taxOnSlab)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Enter income to see tax slabs</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Income Comparison Table */}
        {taxResults && comparisonData.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowComparisonTable(!showComparisonTable)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 smooth-transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-black">Income Comparison Table</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Compare tax metrics across different income levels (50% to 200% of your income)
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 smooth-transition ${
                    showComparisonTable ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showComparisonTable && (
                <div className="border-t border-gray-100 overflow-x-auto animate-fade-in">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-black">Monthly Salary</TableHead>
                        {hasBonusesInTable && (
                          <TableHead className="font-semibold text-black">Annual Bonus</TableHead>
                        )}
                        <TableHead className="font-semibold text-black">Total Monthly Income</TableHead>
                        <TableHead className="font-semibold text-black">Tax Due (Monthly)</TableHead>
                        <TableHead className="font-semibold text-black">Take-Home (Monthly)</TableHead>
                        <TableHead className="font-semibold text-black text-right">Effective Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonData.map((row, index) => (
                        <TableRow
                          key={index}
                          className={row.isCurrentIncome ? "bg-black text-white hover:bg-black" : ""}
                        >
                          <TableCell className={`font-medium ${row.isCurrentIncome ? "text-white" : "text-black"}`}>
                            ৳{(row.monthlySalary / 1000).toFixed(1)}k
                            {row.isCurrentIncome && (
                              <span className="ml-2 text-xs bg-white text-black px-2 py-0.5 rounded-full">
                                Your Income
                              </span>
                            )}
                          </TableCell>
                          {hasBonusesInTable && (
                            <TableCell className={row.isCurrentIncome ? "text-white" : "text-gray-700"}>
                              ৳{(row.bonus / 1000).toFixed(1)}k
                            </TableCell>
                          )}
                          <TableCell className={row.isCurrentIncome ? "text-white" : "text-gray-700"}>
                            ৳{(row.totalMonthlyIncome / 1000).toFixed(1)}k
                          </TableCell>
                          <TableCell className={row.isCurrentIncome ? "text-white" : "text-gray-700"}>
                            ৳{(row.monthlyTax / 1000).toFixed(1)}k
                          </TableCell>
                          <TableCell className={row.isCurrentIncome ? "text-white" : "text-gray-700"}>
                            ৳{(row.monthlyTakeHome / 1000).toFixed(1)}k
                          </TableCell>
                          <TableCell className={`text-right font-medium ${row.isCurrentIncome ? "text-white" : "text-black"}`}>
                            {row.effectiveRate.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Note - Minimal */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Info className="h-3 w-3" />
            <p>
              Estimates for informational purposes · Consult a tax professional · © 2025 Ikram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

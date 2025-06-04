
export interface TaxSlabDetail {
  slabDescription: string;
  taxableAmountInSlab: number;
  taxRate: number;
  taxOnSlab: number;
}

export interface TaxCalculationResult {
  monthlyGrossSalary: number; // Added
  totalAnnualIncome: number;
  standardExemptionApplied: number;
  taxableIncome: number;
  grossTax: number;
  investmentAmountConsidered: number;
  allowableInvestmentLimit: number;
  taxRebate: number;
  netTaxPayable: number;
  finalTaxDue: number;
  monthlyTaxDeduction: number;
  taxSlabBreakdown: TaxSlabDetail[];
  netAnnualIncome: number;
  netMonthlyIncome: number;
  netMonthlySalaryPortionAfterOverallTax: number; // Added
  incomeYear: string;
}

// Tax slabs for general individual taxpayers (Based on Finance Act for Income Year 2024-2025 / Assessment Year 2025-2026)
const TAX_SLABS_2024_2025 = [
  { limit: 350000, rate: 0.00 },
  { limit: 100000, rate: 0.05 },
  { limit: 300000, rate: 0.10 },
  { limit: 400000, rate: 0.15 },
  { limit: 500000, rate: 0.20 },
  { limit: Infinity, rate: 0.25 },
];

// Tax slabs for general individual taxpayers (Based on provided image for Income Year 2025-2026 / Assessment Year 2026-2027)
const TAX_SLABS_2025_2026 = [
  { limit: 375000, rate: 0.00 },
  { limit: 300000, rate: 0.10 },
  { limit: 400000, rate: 0.15 },
  { limit: 500000, rate: 0.20 },
  { limit: 2000000, rate: 0.25 },
  { limit: Infinity, rate: 0.30 },
];

const getTaxSlabsForYear = (incomeYear: string) => {
  if (incomeYear === "2025-2026") {
    return TAX_SLABS_2025_2026;
  }
  return TAX_SLABS_2024_2025;
};


const MINIMUM_TAX_THRESHOLD = 350000;
const MINIMUM_TAX_AMOUNT = 5000;

const INVESTMENT_REBATE_RATE = 0.15;
const MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME = 0.20;
const MAX_INVESTMENT_ALLOWANCE_ABSOLUTE = 10000000;

const STANDARD_EXEMPTION_ABSOLUTE_CAP = 450000;
const STANDARD_EXEMPTION_INCOME_FRACTION = 1 / 3;

export function calculateBdTax(
  monthlyGrossSalary: number,
  annualBonuses: number,
  includeInvestments: boolean,
  totalAnnualInvestment: number,
  incomeYear: string
): TaxCalculationResult {
  const annualSalary = monthlyGrossSalary * 12;
  const totalAnnualIncome = annualSalary + (annualBonuses || 0);

  const exemptionBasedOnIncome = totalAnnualIncome * STANDARD_EXEMPTION_INCOME_FRACTION;
  const standardExemptionApplied = Math.min(STANDARD_EXEMPTION_ABSOLUTE_CAP, exemptionBasedOnIncome);

  const taxableIncome = Math.max(0, totalAnnualIncome - standardExemptionApplied);

  let remainingIncome = taxableIncome;
  let grossTax = 0;
  const taxSlabBreakdown: TaxSlabDetail[] = [];
  let cumulativeSlabLimit = 0;

  const taxSlabsToUse = getTaxSlabsForYear(incomeYear);


  for (const slab of taxSlabsToUse) {
    if (remainingIncome <= 0) break;

    const currentSlabLimit = slab.limit === Infinity ? remainingIncome : slab.limit;
    const incomeInThisSlab = Math.min(remainingIncome, currentSlabLimit);
    
    let slabStart = cumulativeSlabLimit + 1;
    if (cumulativeSlabLimit === 0 && slab.rate === 0.00) slabStart = 0;
    let slabEnd = cumulativeSlabLimit + currentSlabLimit;
    if (slab.limit === Infinity) slabEnd = Infinity;


    const taxOnSlab = incomeInThisSlab * slab.rate;
    grossTax += taxOnSlab;

    let slabDescription = "";
    if (slab.limit === Infinity) {
      slabDescription = `Above ${formatCurrency(cumulativeSlabLimit, false)}`;
    } else if (cumulativeSlabLimit === 0 && slab.rate === 0.00) {
       slabDescription = `Up to ${formatCurrency(currentSlabLimit, false)}`;
    }
     else {
      slabDescription = `On next ${formatCurrency(currentSlabLimit, false)} (from ${formatCurrency(cumulativeSlabLimit + 1, false)} to ${formatCurrency(cumulativeSlabLimit + currentSlabLimit, false)})`;
    }


    taxSlabBreakdown.push({
      slabDescription,
      taxableAmountInSlab: incomeInThisSlab,
      taxRate: slab.rate * 100,
      taxOnSlab: taxOnSlab,
    });

    remainingIncome -= incomeInThisSlab;
     if (slab.limit !== Infinity) {
        cumulativeSlabLimit += currentSlabLimit;
    }
  }
  
  if (taxableIncome > 0 && taxSlabsToUse.length > 0 && taxSlabsToUse[0].rate === 0.00 && taxSlabBreakdown.length > 0 && taxSlabBreakdown[0].taxRate === 0.00) {
     taxSlabBreakdown[0].slabDescription = `Up to ${formatCurrency(taxSlabsToUse[0].limit, false)}`;
  }

  let theoreticalAllowableInvestmentLimitForTip = 0;
  if (taxableIncome > 0) {
      const maxInvestmentByIncome = taxableIncome * MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME;
      theoreticalAllowableInvestmentLimitForTip = Math.min(maxInvestmentByIncome, MAX_INVESTMENT_ALLOWANCE_ABSOLUTE);
  }


  let taxRebate = 0;
  let investmentAmountConsidered = 0; 

  if (includeInvestments && totalAnnualInvestment > 0 && taxableIncome > 0) {
      const actualEligibleInvestmentForRebateCalc = Math.min(totalAnnualInvestment, theoreticalAllowableInvestmentLimitForTip);
      investmentAmountConsidered = totalAnnualInvestment;
      taxRebate = actualEligibleInvestmentForRebateCalc * INVESTMENT_REBATE_RATE;
  }

  taxRebate = Math.min(taxRebate, grossTax); 
  const netTaxPayable = grossTax - taxRebate;

  let currentMinimumTaxThreshold = MINIMUM_TAX_THRESHOLD;
  if (incomeYear === "2025-2026" && taxSlabsToUse[0]?.limit) {
      currentMinimumTaxThreshold = taxSlabsToUse[0].limit;
  }


  let finalTaxDue = Math.max(0, netTaxPayable);

  if (taxableIncome > currentMinimumTaxThreshold && finalTaxDue > 0 && finalTaxDue < MINIMUM_TAX_AMOUNT) {
    finalTaxDue = MINIMUM_TAX_AMOUNT;
  } else if (taxableIncome <= currentMinimumTaxThreshold && finalTaxDue <=0 ) {
     finalTaxDue = 0;
  }

  const monthlyTaxDeduction = finalTaxDue / 12;
  const netAnnualIncome = totalAnnualIncome - finalTaxDue;
  const netMonthlyIncome = netAnnualIncome / 12;
  const netMonthlySalaryPortionAfterOverallTax = monthlyGrossSalary - monthlyTaxDeduction;

  return {
    monthlyGrossSalary,
    totalAnnualIncome,
    standardExemptionApplied,
    taxableIncome,
    grossTax,
    investmentAmountConsidered,
    allowableInvestmentLimit: theoreticalAllowableInvestmentLimitForTip,
    taxRebate,
    netTaxPayable,
    finalTaxDue,
    monthlyTaxDeduction,
    taxSlabBreakdown,
    netAnnualIncome,
    netMonthlyIncome,
    netMonthlySalaryPortionAfterOverallTax,
    incomeYear,
  };
}

export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const formattedAmount = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return includeSymbol ? `BDT ${formattedAmount}` : formattedAmount;
}

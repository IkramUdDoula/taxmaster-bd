
export interface TaxSlabDetail {
  slabDescription: string;
  taxableAmountInSlab: number;
  taxRate: number;
  taxOnSlab: number;
}

export interface TaxCalculationResult {
  totalAnnualIncome: number;
  standardExemptionApplied: number;
  taxableIncome: number;
  grossTax: number;
  investmentAmountConsidered: number;
  allowableInvestmentLimit: number; // Theoretical maximum investment for rebate tip
  taxRebate: number;
  netTaxPayable: number;
  finalTaxDue: number;
  monthlyTaxDeduction: number;
  taxSlabBreakdown: TaxSlabDetail[];
  netAnnualIncome: number;
  netMonthlyIncome: number;
  incomeYear: string;
}

// Tax slabs for general individual taxpayers (Based on Finance Act for Income Year 2024-2025 / Assessment Year 2025-2026)
const TAX_SLABS_2024_2025 = [
  { limit: 350000, rate: 0.00 }, // First 350,000
  { limit: 100000, rate: 0.05 }, // Next 100,000 (Cumulative: 450,000)
  { limit: 300000, rate: 0.10 }, // Next 300,000 (Cumulative: 750,000)
  { limit: 400000, rate: 0.15 }, // Next 400,000 (Cumulative: 1,150,000)
  { limit: 500000, rate: 0.20 }, // Next 500,000 (Cumulative: 1,650,000)
  { limit: Infinity, rate: 0.25 }, // On balance amount (Above 1,650,000)
];

// For now, we'll use 2024-2025 rules regardless of selected year.
const getTaxSlabsForYear = (incomeYear: string) => {
  return TAX_SLABS_2024_2025;
};


const MINIMUM_TAX_THRESHOLD = 350000;
const MINIMUM_TAX_AMOUNT = 5000; 

const INVESTMENT_REBATE_RATE = 0.15; // 15%
const MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME = 0.20; // 20% of Taxable Income
const MAX_INVESTMENT_ALLOWANCE_ABSOLUTE = 10000000; // BDT 1 Crore (10 million)

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
      slabDescription = `On next ${formatCurrency(currentSlabLimit, false)} (from ${formatCurrency(slabStart, false)} to ${slab.limit === Infinity ? 'balance' : formatCurrency(slabEnd, false)})`;
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

  // Calculate the theoretical maximum investment limit for the rebate tip
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
  let finalTaxDue = Math.max(0, netTaxPayable);

  if (taxableIncome > MINIMUM_TAX_THRESHOLD && finalTaxDue > 0 && finalTaxDue < MINIMUM_TAX_AMOUNT) {
    finalTaxDue = MINIMUM_TAX_AMOUNT;
  } else if (taxableIncome <= MINIMUM_TAX_THRESHOLD && finalTaxDue <= 0 ) {
     finalTaxDue = 0;
  }


  const monthlyTaxDeduction = finalTaxDue / 12;
  const netAnnualIncome = totalAnnualIncome - finalTaxDue;
  const netMonthlyIncome = netAnnualIncome / 12;

  return {
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
    incomeYear,
  };
}

export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const formattedAmount = amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return includeSymbol ? `BDT ${formattedAmount}` : formattedAmount;
}

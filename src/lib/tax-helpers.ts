
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

// Tax slabs for general individual taxpayers (Based on provided image for Income Year 2025-2026 / Assessment Year 2026-2027)
const TAX_SLABS_2025_2026 = [
  { limit: 375000, rate: 0.00 },   // First 375,000
  { limit: 300000, rate: 0.10 },   // Next 300,000 (Cumulative up to 675,000)
  { limit: 400000, rate: 0.15 },   // Next 400,000 (Cumulative up to 1,075,000)
  { limit: 500000, rate: 0.20 },   // Next 500,000 (Cumulative up to 1,575,000)
  { limit: 2000000, rate: 0.25 },  // Next 2,000,000 (Cumulative up to 3,575,000)
  { limit: Infinity, rate: 0.30 }, // On balance amount (Above 3,575,000)
];

const getTaxSlabsForYear = (incomeYear: string) => {
  if (incomeYear === "2025-2026") {
    return TAX_SLABS_2025_2026;
  }
  // Default to 2024-2025 rules for "2024-2025" and any other unspecified year (e.g., "2023-2024")
  return TAX_SLABS_2024_2025;
};


const MINIMUM_TAX_THRESHOLD = 350000; // This might need adjustment per year if rules change
const MINIMUM_TAX_AMOUNT = 5000; // This might need adjustment per year if rules change

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
    if (cumulativeSlabLimit === 0 && slab.rate === 0.00) slabStart = 0; // For the first slab (0% tax)
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
      // For subsequent slabs, describe as "On next X (from Y to Z)"
      // Y is cumulativeSlabLimit + 1
      // Z is cumulativeSlabLimit + currentSlabLimit
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
  
  // Ensure the first slab description is "Up to X" if it's a 0% slab from the beginning.
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
      // Eligible investment for rebate is the minimum of actual investment, 20% of taxable income, or 1 Cr.
      const actualEligibleInvestmentForRebateCalc = Math.min(totalAnnualInvestment, theoreticalAllowableInvestmentLimitForTip);
      investmentAmountConsidered = totalAnnualInvestment; // Show what user entered, rebate calc uses eligible amount
      taxRebate = actualEligibleInvestmentForRebateCalc * INVESTMENT_REBATE_RATE;
  }

  // Tax rebate cannot exceed the gross tax amount
  taxRebate = Math.min(taxRebate, grossTax); 
  const netTaxPayable = grossTax - taxRebate;

  // Apply minimum tax rules
  // Note: Minimum tax rules can be complex and vary (e.g., based on location, taxpayer type).
  // This is a simplified general rule.
  // The MINIMUM_TAX_THRESHOLD itself could be different per year or specific to gender/age etc.
  // For now, we use the general threshold.
  let currentMinimumTaxThreshold = MINIMUM_TAX_THRESHOLD;
  if (incomeYear === "2025-2026" && taxSlabsToUse[0].limit) { // Adjust threshold if first slab limit changes
      currentMinimumTaxThreshold = taxSlabsToUse[0].limit;
  }


  let finalTaxDue = Math.max(0, netTaxPayable);

  // If taxable income is above the 0% slab and calculated tax is positive but below minimum tax, set to minimum tax.
  if (taxableIncome > currentMinimumTaxThreshold && finalTaxDue > 0 && finalTaxDue < MINIMUM_TAX_AMOUNT) {
    finalTaxDue = MINIMUM_TAX_AMOUNT;
  } else if (taxableIncome <= currentMinimumTaxThreshold && finalTaxDue <=0 ) { // If income is within 0% slab (or less), tax is 0
     finalTaxDue = 0;
  }
  // If income is above 0% slab but initial calc is 0 (e.g. due to full rebate), and taxable income > threshold, it implies minimum tax should apply.
  // However, the previous rule (finalTaxDue > 0 && finalTaxDue < MINIMUM_TAX_AMOUNT) covers this when netTaxPayable is positive.
  // If netTaxPayable is 0 due to rebate, and income > threshold, the tax should be 0 unless specific rules say otherwise.
  // The current logic seems to handle it: if netTaxPayable is 0, finalTaxDue is 0. If netTaxPayable is 1-4999, it becomes 5000.


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

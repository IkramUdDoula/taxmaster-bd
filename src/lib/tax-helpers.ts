
export interface TaxSlabDetail {
  slabDescription: string;
  taxableAmountInSlab: number;
  taxRate: number;
  taxOnSlab: number;
}

export interface TaxCalculationResult {
  monthlyGrossSalary: number;
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
  netMonthlySalaryPortionAfterOverallTax: number;
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
  { limit: 375000, rate: 0.00 }, // First 3.75 lakh
  { limit: 300000, rate: 0.10 }, // Next 3 lakh
  { limit: 400000, rate: 0.15 }, // Next 4 lakh
  { limit: 500000, rate: 0.20 }, // Next 5 lakh
  { limit: 2000000, rate: 0.25 }, // Next 20 lakh
  { limit: Infinity, rate: 0.30 }, // Rest
];

const getTaxSlabsForYear = (incomeYear: string) => {
  if (incomeYear === "2025-2026") {
    return TAX_SLABS_2025_2026;
  }
  // Fallback for 2023-2024 and 2024-2025 to use 2024-2025 rules
  return TAX_SLABS_2024_2025;
};


const MINIMUM_TAX_THRESHOLD_BASE = 350000; // Base, will be adjusted by first slab
const MINIMUM_TAX_AMOUNT = 5000;

export const INVESTMENT_REBATE_RATE = 0.15;
export const MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME = 0.20;
export const MAX_INVESTMENT_ALLOWANCE_ABSOLUTE = 10000000; // 1 Crore BDT

export const STANDARD_EXEMPTION_ABSOLUTE_CAP = 450000;
export const STANDARD_EXEMPTION_INCOME_FRACTION = 1 / 3;

export function calculateBdTax(
  monthlyGrossSalaryInput: number,
  annualBonuses: number,
  includeInvestments: boolean,
  totalAnnualInvestment: number,
  incomeYear: string
): TaxCalculationResult {
  const monthlyGrossSalary = monthlyGrossSalaryInput || 0;
  const annualSalary = monthlyGrossSalary * 12;
  const totalAnnualIncome = annualSalary + (annualBonuses || 0);

  let exemptionBasedOnIncome = totalAnnualIncome * STANDARD_EXEMPTION_INCOME_FRACTION;
  let standardExemptionApplied = Math.min(STANDARD_EXEMPTION_ABSOLUTE_CAP, exemptionBasedOnIncome);
  standardExemptionApplied = Math.ceil(standardExemptionApplied);

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


    let taxOnSlab = incomeInThisSlab * slab.rate;
    taxOnSlab = Math.ceil(taxOnSlab); // Round up tax for this slab
    grossTax += taxOnSlab; // Accumulate rounded up tax

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
      taxOnSlab: taxOnSlab, // Store rounded tax
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
      theoreticalAllowableInvestmentLimitForTip = Math.ceil(theoreticalAllowableInvestmentLimitForTip); // Round up
  }


  let taxRebate = 0;
  let investmentAmountConsidered = totalAnnualInvestment; 

  if (includeInvestments && totalAnnualInvestment > 0 && taxableIncome > 0) {
      const actualEligibleInvestmentForRebateCalc = Math.min(totalAnnualInvestment, theoreticalAllowableInvestmentLimitForTip);
      let calculatedRebate = actualEligibleInvestmentForRebateCalc * INVESTMENT_REBATE_RATE;
      taxRebate = Math.ceil(calculatedRebate); // Round up
  }

  taxRebate = Math.min(taxRebate, grossTax); 
  const netTaxPayable = Math.max(0, grossTax - taxRebate);


  let currentMinimumTaxThreshold = MINIMUM_TAX_THRESHOLD_BASE;
  if (taxSlabsToUse[0]?.limit && taxSlabsToUse[0].rate === 0.00) {
      currentMinimumTaxThreshold = taxSlabsToUse[0].limit;
  }

  let finalTaxDue = netTaxPayable;

  if (taxableIncome > currentMinimumTaxThreshold && finalTaxDue > 0 && finalTaxDue < MINIMUM_TAX_AMOUNT) {
    finalTaxDue = MINIMUM_TAX_AMOUNT;
  } else if (taxableIncome <= currentMinimumTaxThreshold && finalTaxDue <=0 ) {
     finalTaxDue = 0;
  }
  finalTaxDue = Math.ceil(finalTaxDue); // Final round up for the amount due


  let monthlyTaxDeduction = finalTaxDue > 0 ? finalTaxDue / 12 : 0;
  monthlyTaxDeduction = Math.ceil(monthlyTaxDeduction); // Round up

  const netAnnualIncome = totalAnnualIncome - finalTaxDue;
  const netMonthlySalaryPortionAfterOverallTax = monthlyGrossSalary - monthlyTaxDeduction;

  return {
    monthlyGrossSalary,
    totalAnnualIncome,
    standardExemptionApplied,
    taxableIncome,
    grossTax, // Already sum of rounded slab taxes
    investmentAmountConsidered,
    allowableInvestmentLimit: theoreticalAllowableInvestmentLimitForTip, // Already rounded
    taxRebate, // Already rounded
    netTaxPayable,
    finalTaxDue, // Already rounded
    monthlyTaxDeduction, // Already rounded
    taxSlabBreakdown,
    netAnnualIncome,
    netMonthlySalaryPortionAfterOverallTax,
    incomeYear,
  };
}

export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const roundedAmount = Math.ceil(amount); // Round up to the nearest whole number
  const formattedAmount = roundedAmount.toLocaleString('en-IN', { 
    minimumFractionDigits: 0, // Display as whole number
    maximumFractionDigits: 0  // Display as whole number
  });
  return includeSymbol ? `BDT ${formattedAmount}` : formattedAmount;
}

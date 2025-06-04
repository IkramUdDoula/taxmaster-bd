
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
  allowableInvestmentLimit: number;
  taxRebate: number;
  netTaxPayable: number;
  finalTaxDue: number;
  monthlyTaxDeduction: number;
  taxSlabBreakdown: TaxSlabDetail[];
}

// Tax slabs for general individual taxpayers (Year 2023-2024, example)
const TAX_SLABS = [
  { limit: 350000, rate: 0.00 },
  { limit: 100000, rate: 0.05 }, // On next 100,000 (Total 450,000)
  { limit: 300000, rate: 0.10 }, // On next 300,000 (Total 750,000)
  { limit: 400000, rate: 0.15 }, // On next 400,000 (Total 1,150,000)
  { limit: 500000, rate: 0.20 }, // On next 500,000 (Total 1,650,000)
  { limit: Infinity, rate: 0.25 }, // On balance amount
];

const MINIMUM_TAX_THRESHOLD = 350000; // Minimum taxable income to be eligible for minimum tax if tax due is lower.
const MINIMUM_TAX_AMOUNT = 5000; // Simplified: assuming Dhaka/Chittagong city corp. Varies by location.

const INVESTMENT_REBATE_RATE = 0.15; // 15%
const MAX_INVESTMENT_ALLOWANCE_PERCENTAGE = 0.20; // 20% of taxable income
const MAX_INVESTMENT_ALLOWANCE_ABSOLUTE = 10000000; // BDT 1 Crore

// Standard Exemption Constants
const STANDARD_EXEMPTION_ABSOLUTE_CAP = 450000;
const STANDARD_EXEMPTION_INCOME_FRACTION = 1 / 3;

export function calculateBdTax(
  monthlyGrossSalary: number,
  annualBonuses: number,
  includeInvestments: boolean,
  totalAnnualInvestment: number
): TaxCalculationResult {
  const annualSalary = monthlyGrossSalary * 12;
  const totalAnnualIncome = annualSalary + (annualBonuses || 0);

  // Calculate standard exemption
  const exemptionBasedOnIncome = totalAnnualIncome * STANDARD_EXEMPTION_INCOME_FRACTION;
  const standardExemptionApplied = Math.min(STANDARD_EXEMPTION_ABSOLUTE_CAP, exemptionBasedOnIncome);

  const taxableIncome = Math.max(0, totalAnnualIncome - standardExemptionApplied);

  let remainingIncome = taxableIncome;
  let grossTax = 0;
  const taxSlabBreakdown: TaxSlabDetail[] = [];
  let cumulativeSlabLimit = 0;

  for (const slab of TAX_SLABS) {
    if (remainingIncome <= 0) break;

    const currentSlabLimit = slab.limit === Infinity ? remainingIncome : slab.limit;
    const incomeInThisSlab = Math.min(remainingIncome, currentSlabLimit);

    let slabStart = cumulativeSlabLimit + 1;
    if (cumulativeSlabLimit === 0 && slab.rate === 0.00) slabStart = 0; // For first slab
    let slabEnd = cumulativeSlabLimit + currentSlabLimit;
    if (slab.limit === Infinity) slabEnd = Infinity;


    const taxOnSlab = incomeInThisSlab * slab.rate;
    grossTax += taxOnSlab;

    let slabDescription = "";
    if (slab.limit === Infinity) {
      slabDescription = `Above ${cumulativeSlabLimit.toLocaleString()}`;
    } else if (cumulativeSlabLimit === 0 && slab.rate === 0.00) {
       slabDescription = `Up to ${currentSlabLimit.toLocaleString()}`;
    }
     else {
      slabDescription = `On next ${currentSlabLimit.toLocaleString()} (From ${slabStart.toLocaleString()} to ${slabEnd.toLocaleString()})`;
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

  // Ensure first slab "Up to X" is correctly described if taxable income is low but positive
  if (taxableIncome > 0 && taxableIncome <= TAX_SLABS[0].limit && taxSlabBreakdown.length > 0 && taxSlabBreakdown[0].taxRate === 0.00) {
     taxSlabBreakdown[0].slabDescription = `Up to ${TAX_SLABS[0].limit.toLocaleString()}`;
  }


  let taxRebate = 0;
  let investmentAmountConsidered = 0;
  let allowableInvestmentLimit = 0;

  if (includeInvestments && totalAnnualInvestment > 0 && taxableIncome > 0) { // Rebate applicable only if there's taxable income
    const maxInvestmentAllowedByIncome = taxableIncome * MAX_INVESTMENT_ALLOWANCE_PERCENTAGE;
    // Allowable investment for rebate calculation is the minimum of actual investment, 20% of taxable income, or absolute cap
    const actualEligibleInvestmentForRebateCalc = Math.min(totalAnnualInvestment, maxInvestmentAllowedByIncome, MAX_INVESTMENT_ALLOWANCE_ABSOLUTE);
    
    allowableInvestmentLimit = Math.min(maxInvestmentAllowedByIncome, MAX_INVESTMENT_ALLOWANCE_ABSOLUTE); // This is the general limit on investment for rebate purposes.
    investmentAmountConsidered = totalAnnualInvestment; // This is the actual investment made by the user.

    taxRebate = actualEligibleInvestmentForRebateCalc * INVESTMENT_REBATE_RATE;
  }

  // Rebate cannot exceed gross tax
  taxRebate = Math.min(taxRebate, grossTax);

  const netTaxPayable = grossTax - taxRebate;

  let finalTaxDue = Math.max(0, netTaxPayable);

  // Apply minimum tax rules if taxable income exceeds the initial 0% slab limit
  if (taxableIncome > MINIMUM_TAX_THRESHOLD && finalTaxDue > 0 && finalTaxDue < MINIMUM_TAX_AMOUNT) {
    finalTaxDue = MINIMUM_TAX_AMOUNT;
  } else if (taxableIncome <= MINIMUM_TAX_THRESHOLD && finalTaxDue <= 0 ) { // If income doesn't cross threshold, tax can be 0
     finalTaxDue = 0;
  }


  const monthlyTaxDeduction = finalTaxDue / 12;

  return {
    totalAnnualIncome,
    standardExemptionApplied,
    taxableIncome,
    grossTax,
    investmentAmountConsidered: includeInvestments ? totalAnnualInvestment : 0,
    allowableInvestmentLimit: includeInvestments ? allowableInvestmentLimit : 0,
    taxRebate,
    netTaxPayable,
    finalTaxDue,
    monthlyTaxDeduction,
    taxSlabBreakdown,
  };
}

export function formatCurrency(amount: number): string {
  return `BDT ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

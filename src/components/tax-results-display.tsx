"use client";

import type { TaxCalculationResult } from "@/lib/tax-helpers";
import { formatCurrency } from "@/lib/tax-helpers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EffectiveTaxRatePopup } from "@/components/effective-tax-rate-popup";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardList, Landmark, TrendingDown, Briefcase, ArrowUpCircle, ArrowDownCircle, Info, Lightbulb, Wallet, Calculator } from "lucide-react";

interface TaxResultsDisplayProps {
  results: TaxCalculationResult;
}

export function TaxResultsDisplay({ results }: TaxResultsDisplayProps) {
  const savingsFromInvestment = results.taxRebate;
  const effectiveTaxRate = ((results.finalTaxDue / results.totalAnnualIncome) * 100).toFixed(2);
  
  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Key Metrics Dashboard */}
      <div className="flex flex-col gap-4 mb-8">
        <Card className="gradient-success text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Annual Take-Home</p>
                <p className="text-2xl font-bold">BDT {formatCurrency(results.netAnnualIncome, false)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          </CardContent>
        </Card>

        <Card className="gradient-warning text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Tax Due</p>
                <p className="text-2xl font-bold">BDT {formatCurrency(results.finalTaxDue, false)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          </CardContent>
        </Card>

        <EffectiveTaxRatePopup
  incomeYear={results.incomeYear}
  taxpayerCategory={"men"}
  userGrossIncome={results.totalAnnualIncome}
  trigger={
    <Card className="gradient-info text-white overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Effective Tax Rate</p>
            <p className="text-2xl font-bold">{effectiveTaxRate}%</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
      </CardContent>
    </Card>
  }
/>

        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Suggested Monthly Tax Deduction (from Gross Salary)</p>
                <p className="text-2xl font-bold">BDT {formatCurrency(results.monthlyTaxDeduction, false)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          </CardContent>
        </Card>
      </div>



      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tax-summary" className="border-none">
          <Card className="shadow-lg">
            <AccordionTrigger className="w-full hover:no-underline">
              <CardHeader className="bg-primary/10 p-4 md:p-6 w-full text-left">
                <CardTitle className="flex items-center text-primary font-headline text-lg md:text-xl">
                  <ClipboardList className="mr-2 h-6 w-6 text-primary" />
                  Tax Calculation Summary (Click to Expand)
                </CardTitle>
                <CardDescription>For Income Year: {results.incomeYear}</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-4 md:p-6 space-y-4 text-sm md:text-base">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm md:text-base border-collapse">
                    <tbody>
                      <tr>
                        <td className="font-medium py-2 pr-4">Total Annual Gross Income:</td>
                        <td className="py-2 pl-2 text-right">{formatCurrency(results.totalAnnualIncome)}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2 pr-4">Standard Exemption Applied:</td>
                        <td className="py-2 pl-2 text-green-700 dark:text-green-500 text-right">-{formatCurrency(results.standardExemptionApplied)}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2 pr-4">Taxable Income:</td>
                        <td className="py-2 pl-2 text-right">{formatCurrency(results.taxableIncome)}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2 pr-4">Gross Tax Liability:</td>
                        <td className="py-2 pl-2 text-right">{formatCurrency(results.grossTax)}</td>
                      </tr>
                      {results.investmentAmountConsidered > 0 && results.taxableIncome > 0 && (
                        <>
                          <tr>
                            <td className="font-medium py-2 pr-4">Investment Amount Considered (User Input):</td>
                            <td className="py-2 pl-2 text-right">{formatCurrency(results.investmentAmountConsidered)}</td>
                          </tr>
                          <tr>
                            <td className="font-medium py-2 pr-4">Tax Rebate:</td>
                            <td className="py-2 pl-2 text-green-700 dark:text-green-500 text-right">-{formatCurrency(results.taxRebate)}</td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td className="font-medium py-2 pr-4">Net Tax Payable (after rebate):</td>
                        <td className="py-2 pl-2 text-primary font-bold text-right">{formatCurrency(results.netTaxPayable)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
      
      {results.taxableIncome > 0 && results.allowableInvestmentLimit > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="investment-rebate-tip" className="border-none">
            <Card className="shadow-lg">
              <AccordionTrigger className="w-full hover:no-underline">
                <CardHeader className="bg-teal-600/10 dark:bg-teal-400/10 p-4 md:p-6 w-full text-left">
                  <CardTitle className="flex items-center text-teal-700 dark:text-teal-300 font-headline text-lg md:text-xl">
                    <Lightbulb className="mr-2 h-6 w-6" />
                    Investment Rebate Tip (Click to Expand)
                  </CardTitle>
                  <CardDescription>Maximize your savings for Income Year: {results.incomeYear}</CardDescription>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-4 md:p-6 space-y-4 text-sm md:text-base">
                  <p className="mb-3">
                    To maximize your potential tax rebate for income year {results.incomeYear},
                    you can make eligible investments up to <strong>{formatCurrency(results.allowableInvestmentLimit)}</strong>.
                    Below are some common investment avenues and their specific considerations:
                  </p>
                  <div className="overflow-x-auto">
                    <Table className="mb-3 text-sm md:text-base min-w-[600px] md:min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">Investment Avenue</TableHead>
                          <TableHead className="font-medium">Tax Rebate Considerations</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Shares of companies listed on the stock exchange in Bangladesh</TableCell>
                          <TableCell>No upper limit for tax rebate.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Investment in mutual funds/unit funds or debentures</TableCell>
                          <TableCell>Maximum limit for tax rebate – {formatCurrency(500000)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Investment in Deposit Pension Scheme (DPS) of any scheduled bank or financial institution</TableCell>
                          <TableCell>Maximum limit for tax rebate – {formatCurrency(120000)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Investment in government securities (such as savings certificates, T-bonds/bills, etc.)</TableCell>
                          <TableCell>Maximum limit for tax rebate – {formatCurrency(500000)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <p>
                    The term 'No upper limit for tax rebate' for certain investments means there's no specific cap for that category's contribution to your total eligible investment amount. The overall eligible investment is still capped at {formatCurrency(results.allowableInvestmentLimit)}. The tax rebate is then 15% of this total actual eligible investment (considering various specific limits and actual investments), but cannot exceed your gross tax liability. These are general guidelines; always consult with a tax professional for personalized advice.
                  </p>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      )}

     {results.taxableIncome > 0 && results.grossTax > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="tax-slab-breakdown" className="border-none">
            <Card className="shadow-lg">
              <AccordionTrigger className="w-full hover:no-underline">
                <CardHeader className="bg-secondary/20 w-full p-4 md:p-6 text-left">
                  <CardTitle className="flex items-center text-primary font-headline text-lg md:text-xl">
                    <TrendingDown className="mr-2 h-6 w-6 text-primary" />
                    Tax Slab Breakdown (Click to Expand)
                  </CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] md:min-w-full text-sm md:text-base">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Slab Description</TableHead>
                          <TableHead className="text-right">Taxable Amount</TableHead>
                          <TableHead className="text-right">Tax Rate</TableHead>
                          <TableHead className="text-right">Tax on Slab</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.taxSlabBreakdown.map((slab, index) => (
                          <TableRow key={index}>
                            <TableCell>{slab.slabDescription}</TableCell>
                            <TableCell className="text-right">{formatCurrency(slab.taxableAmountInSlab, false)}</TableCell>
                            <TableCell className="text-right">{slab.taxRate.toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{formatCurrency(slab.taxOnSlab)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                          <TableCell colSpan={3} className="text-right">Total Gross Tax</TableCell>
                          <TableCell className="text-right">{formatCurrency(results.grossTax)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      )}

      <Card className="shadow-lg bg-blue-500/10 dark:bg-blue-400/10">
         <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-300 font-headline text-base md:text-lg">
                <Info className="mr-2 h-5 w-5"/> Important Note
            </CardTitle>
         </CardHeader>
         <CardContent className="text-sm md:text-base text-blue-700 dark:text-blue-300 p-4 md:p-6 pt-0 md:pt-0">
            <p>The tax calculations provided are based on the rules applicable for the <strong>Income Year {results.incomeYear}</strong> (Assessment Year typically {parseInt(results.incomeYear.split('-')[0])+1}-{parseInt(results.incomeYear.split('-')[1])+1}). Tax laws can change, so always consult a professional for precise financial planning.</p>
         </CardContent>
      </Card>
    </div>
  );
}


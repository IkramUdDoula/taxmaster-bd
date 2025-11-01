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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="gradient-success text-white overflow-hidden relative border-0 shadow-glow smooth-transition hover:scale-[1.02]">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-white/80 text-sm font-medium tracking-wide">Annual Take-Home</p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">BDT {formatCurrency(results.netAnnualIncome, false)}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </CardContent>
        </Card>

        <Card className="gradient-warning text-white overflow-hidden relative border-0 shadow-glow smooth-transition hover:scale-[1.02]">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-white/80 text-sm font-medium tracking-wide">Total Tax Due</p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">BDT {formatCurrency(results.finalTaxDue, false)}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Calculator className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </CardContent>
        </Card>

        <EffectiveTaxRatePopup
  incomeYear={results.incomeYear}
  taxpayerCategory={"men"}
  userGrossIncome={results.totalAnnualIncome}
  trigger={
    <Card className="gradient-info text-white overflow-hidden relative cursor-pointer border-0 shadow-glow smooth-transition hover:scale-[1.02]">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-white/80 text-sm font-medium tracking-wide">Effective Tax Rate</p>
            <p className="text-3xl md:text-4xl font-bold tracking-tight">{effectiveTaxRate}%</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <TrendingDown className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </CardContent>
    </Card>
  }
/>

        <Card className="gradient-accent text-white overflow-hidden relative border-0 shadow-glow smooth-transition hover:scale-[1.02]">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-white/80 text-sm font-medium tracking-wide">Monthly Tax Deduction</p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">BDT {formatCurrency(results.monthlyTaxDeduction, false)}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ArrowDownCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </CardContent>
        </Card>
      </div>



      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tax-summary" className="border-none">
          <Card className="shadow-glow border-2 border-border/50 smooth-transition hover:border-primary/50">
            <AccordionTrigger className="w-full hover:no-underline">
              <CardHeader className="bg-primary/5 p-6 md:p-8 w-full text-left rounded-t-xl">
                <CardTitle className="flex items-center text-primary font-headline text-xl md:text-2xl tracking-tight">
                  <ClipboardList className="mr-3 h-7 w-7 text-primary" />
                  Tax Calculation Summary
                </CardTitle>
                <CardDescription className="text-base mt-2">For Income Year: {results.incomeYear}</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-base border-collapse">
                    <tbody className="space-y-2">
                      <tr className="border-b border-border/50">
                        <td className="font-semibold py-4 pr-4 tracking-tight">Total Annual Gross Income</td>
                        <td className="py-4 pl-2 text-right font-mono">{formatCurrency(results.totalAnnualIncome)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="font-semibold py-4 pr-4 tracking-tight">Standard Exemption Applied</td>
                        <td className="py-4 pl-2 text-green-400 text-right font-mono">-{formatCurrency(results.standardExemptionApplied)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="font-semibold py-4 pr-4 tracking-tight">Taxable Income</td>
                        <td className="py-4 pl-2 text-right font-mono">{formatCurrency(results.taxableIncome)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="font-semibold py-4 pr-4 tracking-tight">Gross Tax Liability</td>
                        <td className="py-4 pl-2 text-right font-mono">{formatCurrency(results.grossTax)}</td>
                      </tr>
                      {results.investmentAmountConsidered > 0 && results.taxableIncome > 0 && (
                        <>
                          <tr className="border-b border-border/50">
                            <td className="font-semibold py-4 pr-4 tracking-tight">Investment Amount Considered</td>
                            <td className="py-4 pl-2 text-right font-mono">{formatCurrency(results.investmentAmountConsidered)}</td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="font-semibold py-4 pr-4 tracking-tight">Tax Rebate</td>
                            <td className="py-4 pl-2 text-green-400 text-right font-mono">-{formatCurrency(results.taxRebate)}</td>
                          </tr>
                        </>
                      )}
                      <tr className="bg-primary/10 rounded-lg">
                        <td className="font-bold py-4 pr-4 text-lg tracking-tight">Net Tax Payable</td>
                        <td className="py-4 pl-2 text-primary font-bold text-lg text-right font-mono">{formatCurrency(results.netTaxPayable)}</td>
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
            <Card className="shadow-glow border-2 border-teal-500/30 smooth-transition hover:border-teal-500/50">
              <AccordionTrigger className="w-full hover:no-underline">
                <CardHeader className="bg-teal-500/10 p-6 md:p-8 w-full text-left rounded-t-xl">
                  <CardTitle className="flex items-center text-teal-400 font-headline text-xl md:text-2xl tracking-tight">
                    <Lightbulb className="mr-3 h-7 w-7" />
                    Investment Rebate Tip
                  </CardTitle>
                  <CardDescription className="text-base mt-2">Maximize your savings for Income Year: {results.incomeYear}</CardDescription>
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
            <Card className="shadow-glow border-2 border-border/50 smooth-transition hover:border-primary/50">
              <AccordionTrigger className="w-full hover:no-underline">
                <CardHeader className="bg-primary/5 w-full p-6 md:p-8 text-left rounded-t-xl">
                  <CardTitle className="flex items-center text-primary font-headline text-xl md:text-2xl tracking-tight">
                    <TrendingDown className="mr-3 h-7 w-7 text-primary" />
                    Tax Slab Breakdown
                  </CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-6 md:p-8">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] md:min-w-full text-base">
                      <TableHeader>
                        <TableRow className="border-b-2 border-border">
                          <TableHead className="font-bold text-base py-4">Slab Description</TableHead>
                          <TableHead className="text-right font-bold text-base py-4">Taxable Amount</TableHead>
                          <TableHead className="text-right font-bold text-base py-4">Tax Rate</TableHead>
                          <TableHead className="text-right font-bold text-base py-4">Tax on Slab</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.taxSlabBreakdown.map((slab, index) => (
                          <TableRow key={index} className="border-b border-border/50 smooth-transition hover:bg-primary/5">
                            <TableCell className="py-4 font-medium">{slab.slabDescription}</TableCell>
                            <TableCell className="text-right py-4 font-mono">{formatCurrency(slab.taxableAmountInSlab, false)}</TableCell>
                            <TableCell className="text-right py-4 font-mono">{slab.taxRate.toFixed(2)}%</TableCell>
                            <TableCell className="text-right py-4 font-mono">{formatCurrency(slab.taxOnSlab)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-primary/10 border-t-2 border-primary">
                          <TableCell colSpan={3} className="text-right py-4 text-lg">Total Gross Tax</TableCell>
                          <TableCell className="text-right py-4 text-primary text-lg font-mono">{formatCurrency(results.grossTax)}</TableCell>
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

      <Card className="shadow-glow bg-blue-500/10 border-2 border-blue-500/30 smooth-transition hover:border-blue-500/50">
         <CardHeader className="p-6 md:p-8">
            <CardTitle className="flex items-center text-blue-400 font-headline text-xl md:text-2xl tracking-tight">
                <Info className="mr-3 h-7 w-7"/> Important Note
            </CardTitle>
         </CardHeader>
         <CardContent className="text-base text-blue-300/90 p-6 md:p-8 pt-0 md:pt-0 leading-relaxed">
            <p>The tax calculations provided are based on the rules applicable for the <strong className="text-blue-200">Income Year {results.incomeYear}</strong> (Assessment Year typically {parseInt(results.incomeYear.split('-')[0])+1}-{parseInt(results.incomeYear.split('-')[1])+1}). Tax laws can change, so always consult a professional for precise financial planning.</p>
         </CardContent>
      </Card>
    </div>
  );
}



"use client";

import type { TaxCalculationResult } from "@/lib/tax-helpers";
import { formatCurrency } from "@/lib/tax-helpers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardList, Landmark, TrendingDown, Briefcase, ArrowUpCircle, ArrowDownCircle, Info, Lightbulb, Wallet } from "lucide-react";

interface TaxResultsDisplayProps {
  results: TaxCalculationResult;
}

export function TaxResultsDisplay({ results }: TaxResultsDisplayProps) {
  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-green-600/10 dark:bg-green-400/10 p-4 md:p-6">
            <CardTitle className="flex items-center text-green-700 dark:text-green-400 font-headline text-lg md:text-xl">
              <Briefcase className="mr-2 h-6 w-6" />
              Income Overview
            </CardTitle>
            <CardDescription>Income Year: {results.incomeYear}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4 text-sm md:text-base">
              <div className="space-y-1">
                  <div className="flex items-center">
                      <ArrowUpCircle className="mr-2 h-5 w-5 text-foreground/80" />
                      <span>Total Yearly Gross Income:</span>
                  </div>
                  <strong className="text-md md:text-lg block pl-7">{formatCurrency(results.totalAnnualIncome)}</strong>
              </div>
              <Separator />
               <div className="space-y-1">
                  <div className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-foreground/80" />
                      <span>Net Monthly Salary (after tax deduction):</span>
                  </div>
                  <strong className="text-md md:text-lg block pl-7">{formatCurrency(results.netMonthlySalaryPortionAfterOverallTax)}</strong>
              </div>
              <Separator />
              <div className="space-y-1">
                  <div className="flex items-center">
                      <ArrowDownCircle className="mr-2 h-5 w-5 text-green-700 dark:text-green-500" />
                      <span>Total Yearly Net Income (Take Home):</span>
                  </div>
                  <strong className="text-md md:text-lg text-green-700 dark:text-green-500 block pl-7">{formatCurrency(results.netAnnualIncome)}</strong>
              </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-accent/10 p-4 md:p-6">
            <CardTitle className="flex items-center text-primary font-headline text-lg md:text-xl">
              <Landmark className="mr-2 h-6 w-6 text-primary" />
              Final Tax &amp; Monthly Deduction
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 text-center space-y-2">
              <p className="text-base md:text-lg">
                  <strong>Total Yearly Tax Due:</strong>
              </p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                  {formatCurrency(results.finalTaxDue)}
              </p>
              <Separator className="my-4"/>
              <p className="text-sm md:text-base">
                  <strong>Suggested Monthly Tax Deduction (from Gross Salary):</strong>
              </p>
              <p className="text-xl md:text-2xl font-semibold text-accent">
                  {formatCurrency(results.monthlyTaxDeduction)}
              </p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tax-summary" className="border-none">
          <Card className="shadow-lg">
            <AccordionTrigger className="w-full hover:no-underline">
              <CardHeader className="bg-primary/10 p-4 md:p-6 w-full text-left">
                <CardTitle className="flex items-center text-primary font-headline text-xl md:text-2xl">
                  <ClipboardList className="mr-2 h-6 w-6 text-primary" />
                  Tax Calculation Summary (Click to Expand)
                </CardTitle>
                <CardDescription>For Income Year: {results.incomeYear}</CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-4 md:p-6 space-y-4 text-sm md:text-base">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><strong>Total Annual Gross Income:</strong> {formatCurrency(results.totalAnnualIncome)}</p>
                  <p><strong>Standard Exemption Applied:</strong> <span className="text-green-700 dark:text-green-500">-{formatCurrency(results.standardExemptionApplied)}</span></p>
                  <p><strong>Taxable Income:</strong> {formatCurrency(results.taxableIncome)}</p>
                  <p><strong>Gross Tax Liability:</strong> {formatCurrency(results.grossTax)}</p>
                  {results.investmentAmountConsidered > 0 && results.taxableIncome > 0 && (
                    <>
                      <p><strong>Investment Amount Considered (User Input):</strong> {formatCurrency(results.investmentAmountConsidered)}</p>
                      <p><strong>Tax Rebate:</strong> <span className="text-green-700 dark:text-green-500">-{formatCurrency(results.taxRebate)}</span></p>
                    </>
                  )}
                   <p><strong>Net Tax Payable (after rebate):</strong> {formatCurrency(results.netTaxPayable)}</p>
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
                  <CardTitle className="flex items-center text-secondary-foreground font-headline text-lg md:text-xl">
                    <TrendingDown className="mr-2 h-6 w-6 text-secondary-foreground" />
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


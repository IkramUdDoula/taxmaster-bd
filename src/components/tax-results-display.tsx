
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
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center text-primary font-headline">
            <ClipboardList className="mr-2 h-6 w-6 text-primary" />
            Tax Calculation Summary
          </CardTitle>
          <CardDescription>For Income Year: {results.incomeYear}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-green-600/10 dark:bg-green-400/10">
            <CardTitle className="flex items-center text-green-700 dark:text-green-400 font-headline">
              <Briefcase className="mr-2 h-6 w-6" />
              Income Overview
            </CardTitle>
            <CardDescription>Income Year: {results.incomeYear}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <ArrowUpCircle className="mr-2 h-5 w-5 text-foreground/80" />
                      <span>Total Yearly Gross Income:</span>
                  </div>
                  <strong className="text-md">{formatCurrency(results.totalAnnualIncome)}</strong>
              </div>
              <Separator />
               <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-foreground/80" />
                      <span>Net Monthly Salary (after tax deduction):</span>
                  </div>
                  <strong className="text-md">{formatCurrency(results.netMonthlySalaryPortionAfterOverallTax)}</strong>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <ArrowDownCircle className="mr-2 h-5 w-5 text-green-700 dark:text-green-500" />
                      <span>Total Yearly Net Income (Take Home):</span>
                  </div>
                  <strong className="text-md text-green-700 dark:text-green-500">{formatCurrency(results.netAnnualIncome)}</strong>
              </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-accent/10">
            <CardTitle className="flex items-center text-accent-foreground font-headline">
              <Landmark className="mr-2 h-6 w-6 text-accent" />
              Final Tax &amp; Monthly Deduction
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-2">
              <p className="text-lg">
                  <strong>Total Yearly Tax Due:</strong>
              </p>
              <p className="text-3xl font-bold text-primary">
                  {formatCurrency(results.finalTaxDue)}
              </p>
              <Separator className="my-4"/>
              <p className="text-md">
                  <strong>Suggested Monthly Tax Deduction (from Gross Salary):</strong>
              </p>
              <p className="text-2xl font-semibold text-accent">
                  {formatCurrency(results.monthlyTaxDeduction)}
              </p>
          </CardContent>
        </Card>
      </div>
      
      {results.taxableIncome > 0 && results.allowableInvestmentLimit > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-teal-600/10 dark:bg-teal-400/10">
            <CardTitle className="flex items-center text-teal-700 dark:text-teal-300 font-headline">
              <Lightbulb className="mr-2 h-6 w-6" />
              Investment Rebate Tip
            </CardTitle>
            <CardDescription>Maximize your savings for Income Year: {results.incomeYear}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm text-teal-700 dark:text-teal-300">
            <p className="mb-3">
              To maximize your potential tax rebate for income year {results.incomeYear},
              you can make eligible investments up to <strong>{formatCurrency(results.allowableInvestmentLimit)}</strong>.
              Below are some common investment avenues and their specific considerations:
            </p>
            <Table className="mb-3 text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-teal-700 dark:text-teal-400 font-medium">Investment Avenue</TableHead>
                  <TableHead className="text-teal-700 dark:text-teal-400 font-medium">Tax Rebate Considerations</TableHead>
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
            <p>
              The term 'No upper limit for tax rebate' for certain investments means there's no specific cap for that category's contribution to your total eligible investment amount. The overall eligible investment is still capped at {formatCurrency(results.allowableInvestmentLimit)}. The tax rebate is then 15% of this total actual eligible investment (considering various specific limits and actual investments), but cannot exceed your gross tax liability. These are general guidelines; always consult with a tax professional for personalized advice.
            </p>
          </CardContent>
        </Card>
      )}

     {results.taxableIncome > 0 && results.grossTax > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="tax-slab-breakdown" className="border-none">
            <Card className="shadow-lg">
              <AccordionTrigger className="w-full hover:no-underline">
                <CardHeader className="bg-secondary/20 w-full p-6 text-left">
                  <CardTitle className="flex items-center text-secondary-foreground font-headline">
                    <TrendingDown className="mr-2 h-6 w-6 text-secondary-foreground" />
                    Tax Slab Breakdown (Click to Expand)
                  </CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="p-0">
                  <Table>
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
                          <TableCell className="text-right">{formatCurrency(slab.taxableAmountInSlab)}</TableCell>
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
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      )}

      <Card className="shadow-lg bg-blue-500/10 dark:bg-blue-400/10">
         <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-300 font-headline text-lg">
                <Info className="mr-2 h-5 w-5"/> Important Note
            </CardTitle>
         </CardHeader>
         <CardContent className="text-sm text-blue-700 dark:text-blue-300">
            <p>The tax calculations provided are based on the rules applicable for the <strong>Income Year {results.incomeYear}</strong> (Assessment Year typically {parseInt(results.incomeYear.split('-')[0])+1}-{parseInt(results.incomeYear.split('-')[1])+1}). Tax laws can change, so always consult a professional for precise financial planning.</p>
         </CardContent>
      </Card>
    </div>
  );
}

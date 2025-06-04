
"use client";

import type { TaxCalculationResult } from "@/lib/tax-helpers";
import { formatCurrency } from "@/lib/tax-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeDollarSign, ClipboardList, Landmark, TrendingDown, MinusCircle } from "lucide-react";

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
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><strong>Total Annual Income:</strong> {formatCurrency(results.totalAnnualIncome)}</p>
            <p><strong>Standard Exemption Applied:</strong> <span className="text-green-600">-{formatCurrency(results.standardExemptionApplied)}</span></p>
            <p><strong>Taxable Income:</strong> {formatCurrency(results.taxableIncome)}</p>
            <p><strong>Gross Tax Liability:</strong> {formatCurrency(results.grossTax)}</p>
            {results.investmentAmountConsidered > 0 && results.taxableIncome > 0 && (
              <>
                <p><strong>Investment Amount Considered:</strong> {formatCurrency(results.investmentAmountConsidered)}</p>
                <p><strong>Allowable Investment for Rebate:</strong> {formatCurrency(results.allowableInvestmentLimit)}</p>
                <p><strong>Tax Rebate:</strong> <span className="text-green-600">-{formatCurrency(results.taxRebate)}</span></p>
              </>
            )}
             <p><strong>Net Tax Payable (after rebate):</strong> {formatCurrency(results.netTaxPayable)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="bg-accent/10">
          <CardTitle className="flex items-center text-accent-foreground font-headline">
             <Landmark className="mr-2 h-6 w-6 text-accent" />
            Final Tax & Monthly Deduction
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
                <strong>Suggested Monthly Tax Deduction:</strong>
            </p>
             <p className="text-2xl font-semibold text-accent">
                {formatCurrency(results.monthlyTaxDeduction)}
            </p>
        </CardContent>
      </Card>
      
     {results.taxableIncome > 0 && results.grossTax > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="flex items-center text-secondary-foreground font-headline">
              <TrendingDown className="mr-2 h-6 w-6 text-secondary-foreground" />
              Tax Slab Breakdown
            </CardTitle>
          </CardHeader>
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
        </Card>
      )}
    </div>
  );
}

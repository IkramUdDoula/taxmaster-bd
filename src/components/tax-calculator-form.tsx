"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateBdTax, type TaxCalculationResult } from "@/lib/tax-helpers";
import { TaxResultsDisplay } from "./tax-results-display";
import { Calculator, Gift, PiggyBank, WalletCards, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";


export function TaxCalculatorForm() {
  const [monthlySalary, setMonthlySalary] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [includeInvestments, setIncludeInvestments] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [taxResults, setTaxResults] = useState<TaxCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setTaxResults(null);

    const salaryNum = parseFloat(monthlySalary);
    const bonusesNum = parseFloat(bonuses) || 0;
    const investmentNum = includeInvestments ? (parseFloat(investmentAmount) || 0) : 0;

    if (isNaN(salaryNum) || salaryNum <= 0) {
      setError("Please enter a valid monthly gross salary.");
      toast({
        title: "Invalid Input",
        description: "Monthly gross salary must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    if (includeInvestments && (isNaN(investmentNum) || investmentNum < 0)) {
        setError("Please enter a valid investment amount or uncheck the investment option.");
         toast({
            title: "Invalid Input",
            description: "Investment amount must be a non-negative number.",
            variant: "destructive",
        });
        return;
    }


    try {
      const results = calculateBdTax(salaryNum, bonusesNum, includeInvestments, investmentNum);
      setTaxResults(results);
      toast({
        title: "Calculation Successful!",
        description: "Your tax details are now displayed below.",
      });
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during calculation.");
       toast({
        title: "Calculation Error",
        description: e.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Card className="shadow-2xl">
        <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-lg py-8">
          <CardTitle className="text-3xl md:text-4xl font-headline">TaxEase BD</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Bangladesh Income Tax Calculator
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthlySalary" className="flex items-center text-md">
                <WalletCards className="mr-2 h-5 w-5 text-primary" />
                Monthly Gross Salary (BDT)
              </Label>
              <Input
                id="monthlySalary"
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                placeholder="e.g., 50000"
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonuses" className="flex items-center text-md">
                <Gift className="mr-2 h-5 w-5 text-primary" />
                Total Annual Bonuses/Other Income (BDT)
              </Label>
              <Input
                id="bonuses"
                type="number"
                value={bonuses}
                onChange={(e) => setBonuses(e.target.value)}
                placeholder="e.g., 100000"
                className="text-base"
              />
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
              <Switch
                id="includeInvestments"
                checked={includeInvestments}
                onCheckedChange={setIncludeInvestments}
              />
              <Label htmlFor="includeInvestments" className="flex items-center text-md cursor-pointer">
                <PiggyBank className="mr-2 h-5 w-5 text-primary" />
                Include Investments/Savings for Tax Rebate?
              </Label>
            </div>

            {includeInvestments && (
              <div className="space-y-2 pl-4 border-l-2 border-primary ml-2">
                <Label htmlFor="investmentAmount" className="flex items-center text-md">
                  Total Annual Eligible Investment Amount (BDT)
                </Label>
                <Input
                  id="investmentAmount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="e.g., 200000"
                  className="text-base"
                />
              </div>
            )}
             <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Tax
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground p-4 md:p-6 border-t">
            Disclaimer: This calculator provides an estimate for informational purposes only. Consult with a tax professional for accurate advice. Tax laws are subject to change.
        </CardFooter>
      </Card>

      {taxResults && <TaxResultsDisplay results={taxResults} />}
    </div>
  );
}

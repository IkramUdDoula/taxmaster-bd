"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepWizard } from "@/components/ui/step-wizard";
import {
  calculateBdTax,
  type TaxCalculationResult,
  TaxpayerCategory,
  STANDARD_EXEMPTION_CAP,
  STANDARD_EXEMPTION_INCOME_FRACTION,
  MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME,
  MAX_INVESTMENT_ALLOWANCE_ABSOLUTE
} from "@/lib/tax-helpers";
import { TaxResultsDisplay } from "./tax-results-display";
import { 
  Calculator, 
  Gift, 
  PiggyBank, 
  WalletCards, 
  AlertCircle, 
  CalendarDays, 
  Landmark, 
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STEPS = ["Basic Info", "Income Details", "Investments", "Results"];

export function TaxCalculatorWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [incomeInputMode, setIncomeInputMode] = useState<"monthly" | "annual">("monthly");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [totalAnnualGrossIncome, setTotalAnnualGrossIncome] = useState("");
  const [includeInvestments, setIncludeInvestments] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [incomeYear, setIncomeYear] = useState("2025-2026");
  const [taxpayerCategory, setTaxpayerCategory] = useState<TaxpayerCategory>("men");
  const [taxResults, setTaxResults] = useState<TaxCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleIncludeInvestmentsChange = (checked: boolean) => {
    setIncludeInvestments(checked);
    if (checked) {
      let annualIncomeForInvestmentCalc = 0;
      let salaryForInvestmentCalcIsValid = false;

      if (incomeInputMode === "monthly") {
        const salaryNum = parseFloat(monthlySalary);
        const bonusesNum = parseFloat(bonuses) || 0;
        if (!isNaN(salaryNum) && salaryNum > 0) {
          annualIncomeForInvestmentCalc = (salaryNum * 12) + bonusesNum;
          salaryForInvestmentCalcIsValid = true;
        }
      } else {
        const totalAnnualNum = parseFloat(totalAnnualGrossIncome);
        if (!isNaN(totalAnnualNum) && totalAnnualNum > 0) {
          annualIncomeForInvestmentCalc = totalAnnualNum;
          salaryForInvestmentCalcIsValid = true;
        }
      }

      if (salaryForInvestmentCalcIsValid) {
        const exemptionBasedOnIncome = annualIncomeForInvestmentCalc * STANDARD_EXEMPTION_INCOME_FRACTION;
        const cap = STANDARD_EXEMPTION_CAP[incomeYear] ?? 450000;
        const standardExemptionApplied = Math.min(cap, exemptionBasedOnIncome);
        const preliminaryTaxableIncome = Math.max(0, annualIncomeForInvestmentCalc - standardExemptionApplied);

        if (preliminaryTaxableIncome > 0) {
          const maxInvestmentByIncome = preliminaryTaxableIncome * MAX_INVESTMENT_ALLOWANCE_PERCENTAGE_OF_TAXABLE_INCOME;
          const preliminaryAllowableInvestment = Math.min(maxInvestmentByIncome, MAX_INVESTMENT_ALLOWANCE_ABSOLUTE);
          setInvestmentAmount(Math.ceil(preliminaryAllowableInvestment).toFixed(0));
        } else {
          setInvestmentAmount("0");
        }
      } else {
        setInvestmentAmount("0");
      }
    } else {
      setInvestmentAmount("");
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculate = () => {
    setError(null);
    setTaxResults(null);

    let salaryNum = 0;
    let bonusesNum = 0;

    if (incomeInputMode === "monthly") {
      salaryNum = parseFloat(monthlySalary);
      bonusesNum = parseFloat(bonuses) || 0;
      if (isNaN(salaryNum) || salaryNum <= 0) {
        setError("Please enter a valid monthly gross salary.");
        toast({
          title: "Invalid Input",
          description: "Monthly gross salary must be a positive number.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const totalAnnualNum = parseFloat(totalAnnualGrossIncome);
      if (isNaN(totalAnnualNum) || totalAnnualNum <= 0) {
        setError("Please enter a valid total annual gross income.");
        toast({
          title: "Invalid Input",
          description: "Total annual gross income must be a positive number.",
          variant: "destructive",
        });
        return;
      }
      salaryNum = totalAnnualNum / 12;
      bonusesNum = 0;
    }

    const investmentNum = includeInvestments ? (parseFloat(investmentAmount) || 0) : 0;

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
      const results = calculateBdTax(
        salaryNum,
        bonusesNum,
        includeInvestments,
        investmentNum,
        incomeYear,
        taxpayerCategory
      );
      setTaxResults(results);
      setCurrentStep(4);
      toast({
        title: "Calculation Successful!",
        description: `Your tax details for income year ${incomeYear} are now displayed.`,
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

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return taxpayerCategory && incomeYear;
      case 2:
        if (incomeInputMode === "monthly") {
          return monthlySalary && parseFloat(monthlySalary) > 0;
        } else {
          return totalAnnualGrossIncome && parseFloat(totalAnnualGrossIncome) > 0;
        }
      case 3:
        return true; // Investment is optional
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 animate-slide-in">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Let's Get Started</h2>
              <p className="text-muted-foreground">Tell us about yourself and the tax year</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="flex items-center text-lg font-semibold">
                  <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                  Income Year
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: "2024-2025", label: "2024-2025", description: "Assessment Year 2025-2026" },
                    { value: "2025-2026", label: "2025-2026", description: "Assessment Year 2026-2027" },
                  ].map((year) => (
                    <div
                      key={year.value}
                      onClick={() => setIncomeYear(year.value)}
                      className={cn(
                        "flex flex-col items-center space-y-2 p-6 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                        incomeYear === year.value 
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "border-muted-foreground/20"
                      )}
                    >
                      <CalendarDays className="w-8 h-8 text-primary" />
                      <span className="font-semibold text-lg">{year.label}</span>
                      <span className="text-sm text-muted-foreground text-center">{year.description}</span>
                      
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Taxpayer Category</Label>
                <RadioGroup
                  value={taxpayerCategory}
                  onValueChange={(value: TaxpayerCategory) => setTaxpayerCategory(value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {[
                    { value: "men", label: "Men", icon: "👨" },
                    { value: "women", label: "Women", icon: "👩" },
                    { value: "disabled", label: "Disabled / Third Gender", icon: "♿" },
                    { value: "freedom_fighter", label: "Freedom Fighter", icon: "🏅" },
                  ].map((category) => (
                    <div key={category.value} className="relative">
                      <RadioGroupItem 
                        value={category.value} 
                        id={category.value} 
                        className="sr-only" 
                      />
                      <Label
                        htmlFor={category.value}
                        className={cn(
                          "flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                          taxpayerCategory === category.value 
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                            : "border-muted-foreground/20"
                        )}
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                        
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-slide-in">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-success rounded-full flex items-center justify-center">
                <WalletCards className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Income Details</h2>
              <p className="text-muted-foreground">How would you like to enter your income information?</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Income Entry Method</Label>
                <RadioGroup
                  value={incomeInputMode}
                  onValueChange={(value: "monthly" | "annual") => setIncomeInputMode(value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                    <Label
                      htmlFor="monthly"
                      className={cn(
                        "flex flex-col items-center space-y-2 p-6 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                        incomeInputMode === "monthly" 
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "border-muted-foreground/20"
                      )}
                    >
                      <WalletCards className="w-8 h-8 text-primary" />
                      <span className="font-medium">Monthly Salary + Bonuses</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="annual" id="annual" className="sr-only" />
                    <Label
                      htmlFor="annual"
                      className={cn(
                        "flex flex-col items-center space-y-2 p-6 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                        incomeInputMode === "annual" 
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                          : "border-muted-foreground/20"
                      )}
                    >
                      <Landmark className="w-8 h-8 text-primary" />
                      <span className="font-medium">Total Annual Gross Income</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {incomeInputMode === "monthly" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-3">
                    <Label htmlFor="monthlySalary" className="text-lg font-semibold">
                      Monthly Gross Salary (BDT)
                    </Label>
                    <Input
                      id="monthlySalary"
                      type="number"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(e.target.value)}
                      placeholder="e.g., 50,000"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bonuses" className="text-lg font-semibold">
                      Annual Bonuses/Other Income (BDT)
                    </Label>
                    <Input
                      id="bonuses"
                      type="number"
                      value={bonuses}
                      onChange={(e) => setBonuses(e.target.value)}
                      placeholder="e.g., 100,000 (optional)"
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Include festival bonuses, overtime, and other work-related income
                    </p>
                  </div>
                </div>
              )}

              {incomeInputMode === "annual" && (
                <div className="space-y-3 animate-fade-in">
                  <Label htmlFor="totalAnnualGrossIncome" className="text-lg font-semibold">
                    Total Annual Gross Income (BDT)
                  </Label>
                  <Input
                    id="totalAnnualGrossIncome"
                    type="number"
                    value={totalAnnualGrossIncome}
                    onChange={(e) => setTotalAnnualGrossIncome(e.target.value)}
                    placeholder="e.g., 700,000"
                    className="h-12 text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include salary, bonuses, and all other taxable earnings for the year
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-slide-in">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-info rounded-full flex items-center justify-center">
                <PiggyBank className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Investment & Savings</h2>
              <p className="text-muted-foreground">Maximize your tax savings with eligible investments</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 border rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <Label className="text-lg font-semibold">Include Investment Tax Rebate</Label>
                  <p className="text-sm text-muted-foreground">
                    Get 15% tax rebate on eligible investments up to 20% of taxable income
                  </p>
                </div>
                <Switch
                  checked={includeInvestments}
                  onCheckedChange={handleIncludeInvestmentsChange}
                  className="scale-125"
                />
              </div>

              {includeInvestments && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-3">
                    <Label htmlFor="investmentAmount" className="text-lg font-semibold">
                      Total Annual Investment Amount (BDT)
                    </Label>
                    <Input
                      id="investmentAmount"
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="e.g., 200,000"
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      The calculator will automatically cap this at the allowable limit
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Eligible Investment Options:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Listed company shares (no upper limit)</li>
                      <li>• Mutual funds/debentures (max 5 lakh)</li>
                      <li>• DPS schemes (max 1.2 lakh)</li>
                      <li>• Government securities (max 5 lakh)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-slide-in">
            {taxResults ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-bounce-custom">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Tax Calculation Complete!</h2>
                  <p className="text-muted-foreground">Here's your detailed tax breakdown</p>
                </div>
                <TaxResultsDisplay results={taxResults} />
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-warning rounded-full flex items-center justify-center">
                  <Calculator className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Ready to Calculate</h2>
                <p className="text-muted-foreground">Click the button below to calculate your taxes</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Card className="shadow-2xl overflow-hidden">
        <CardHeader className="gradient-primary text-white py-8 md:py-12">
          <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
            Taxmaster
          </CardTitle>
          <CardDescription className="text-white/90 text-lg md:text-xl text-center">
          Your tax planning doesn't have to be stressful.          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
          <StepWizard steps={STEPS} currentStep={currentStep} className="mb-8" />
          
          {error && (
            <Alert variant="destructive" className="mb-6 animate-slide-in">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="min-h-[500px]">
            {renderStepContent()}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-3">
              {currentStep < 3 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="flex items-center space-x-2 gradient-primary text-white"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  onClick={handleCalculate}
                  className="flex items-center space-x-2 gradient-primary text-white px-8"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Tax</span>
                </Button>
              )}

              {currentStep === 4 && taxResults && (
                <Button
                  onClick={() => {
                    setCurrentStep(1);
                    setTaxResults(null);
                    setError(null);
                  }}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <span>Start Over</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

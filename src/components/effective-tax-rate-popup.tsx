"use client";

import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import { calculateBdTax, TaxpayerCategory, STANDARD_EXEMPTION_CAP } from "@/lib/tax-helpers";
import { Toggle } from "@/components/ui/toggle";

interface EffectiveTaxRatePopupProps {
  incomeYear: string;
  taxpayerCategory: TaxpayerCategory;
  trigger: React.ReactNode;
  userGrossIncome: number;
}

export const EffectiveTaxRatePopup: React.FC<EffectiveTaxRatePopupProps> = ({ incomeYear, taxpayerCategory, trigger, userGrossIncome }) => {
  const [maxInvestment, setMaxInvestment] = React.useState(false);
  // Generate data: 1L to 50L, 50 points
  const data = React.useMemo(() => {
    const points = [];
    // 3.5L to 50L in 0.5L increments (350,000 to 5,000,000)
    for (let annualIncome = 350000; annualIncome <= 5000000; annualIncome += 50000) {
      // Determine investment
      let investment = 0;
      if (maxInvestment) {
        // Use the same logic as calculator: max 25% of income or cap for year
        const cap = STANDARD_EXEMPTION_CAP[incomeYear] ?? 450000;
        investment = Math.min(annualIncome * 0.25, cap);
      }
      const taxResult = calculateBdTax(
        annualIncome / 12,
        0,
        maxInvestment,
        investment,
        incomeYear,
        taxpayerCategory
      );
      const effectiveRate = (taxResult.finalTaxDue / annualIncome) * 100;
      const point = {
        annualIncome,
        effectiveRate: Number(effectiveRate.toFixed(2)),
        isUser: annualIncome === userGrossIncome
      };
      points.push(point);
    }
    // If user's income is not on a tick, add it exactly
    if (userGrossIncome && !points.some(p => p.isUser)) {
      let investment = 0;
      if (maxInvestment) {
        const cap = STANDARD_EXEMPTION_CAP[incomeYear] ?? 450000;
        investment = Math.min(userGrossIncome * 0.25, cap);
      }
      const taxResult = calculateBdTax(
        userGrossIncome / 12,
        0,
        maxInvestment,
        investment,
        incomeYear,
        taxpayerCategory
      );
      const effectiveRate = (taxResult.finalTaxDue / userGrossIncome) * 100;
      points.push({
        annualIncome: userGrossIncome,
        effectiveRate: Number(effectiveRate.toFixed(2)),
        isUser: true
      });
      points.sort((a, b) => a.annualIncome - b.annualIncome);
    }
    return points;
  }, [incomeYear, taxpayerCategory, userGrossIncome, maxInvestment]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {React.cloneElement(trigger as React.ReactElement, {
          onClick: (e: React.MouseEvent) => {
            if (window.innerWidth < 920) {
              e.preventDefault();
              alert("The chart popup is only available on larger screens (desktop). Please use a device or window at least 920px wide.");
              return;
            }
            if (typeof (trigger as any).props.onClick === "function") {
              (trigger as any).props.onClick(e);
            }
          }
        })}
      </DialogTrigger>
      <DialogContent className="min-w-[600px] max-w-4xl min-h-[400px]">
        <DialogHeader>
          <DialogTitle>Effective Tax Rate vs Gross Income</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[400px] md:h-[500px] flex flex-col gap-2">
          <div className="mb-2 flex justify-start">
            <Toggle
              label="Calculate with maximum allowed investment"
              checked={maxInvestment}
              onChange={e => setMaxInvestment(e.target.checked)}
            />
          </div>
          <ChartContainer config={{}}>

  <ChartTooltip content={<ChartTooltipContent />} />
  <ChartLegend content={<ChartLegendContent />} />
  <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
    <XAxis
      dataKey="annualIncome"
      tickFormatter={v => `${(v / 100000).toFixed(0)}`}
      label={{ value: "Gross Income (Lac / BDT)", position: "insideBottom", offset: -10 }}
    />
    <YAxis
      dataKey="effectiveRate"
      tickFormatter={v => `${v}%`}
      label={{ value: "Effective Tax Rate (%)", angle: -90, position: "insideLeft", offset: 10 }}
    />
    <Tooltip
      formatter={(_: any, __: any, { payload }: any) => [`${payload.effectiveRate}%`, `Effective Rate`]} 
      labelFormatter={label => `Annual Income: BDT ${(label / 100000).toFixed(2)}L`}
    />
    <Line
      type="monotone"
      dataKey="effectiveRate"
      stroke="#7c3aed"
      strokeWidth={3}
      dot={({ cx, cy, payload }) =>
        payload.isUser ? (
          <circle cx={cx} cy={cy} r={7} fill="#f59e42" stroke="#fff" strokeWidth={2} />
        ) : <g />
      }
      isAnimationActive={true}
    />
  </RechartsLineChart>
</ChartContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Import from recharts for direct primitives
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

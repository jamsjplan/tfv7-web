"use client";

import { useMemo } from "react";
import { CalcResult, CarRow, RecommendedCar } from "@/types/cars";
import { getLeaseMonths } from "@/utils/lease";

type Args = {
  cars: CarRow[];
  modelMap: Map<string, RecommendedCar>;
  optionPrice: number;
  miscFee: number;
};

export function useLeaseCalc({ cars, modelMap, optionPrice, miscFee }: Args) {
  const calculate = (): CalcResult => {
    if (cars.length === 0 || cars.some((c) => !c.modelId)) {
      return {
        carPriceTotal: 0,
        taxTotal: 0,
        optionTotal: 0,
        miscTotal: 0,
        totalPurchase: 0,
        tfvTotal: 0,
        leaseBreakdown: [],
        resaleCount: 0,
        resaleTotal: 0,
        savings: 0,
        error: "車種を選択してください",
      };
    }

    const taxRate = 0.1;

    const carPriceTotal = cars.reduce(
      (sum, c) => sum + (modelMap.get(c.modelId!)?.fullprice ?? 0),
      0
    );
    const taxTotal = Math.floor(carPriceTotal * taxRate);

    const optionTotal = optionPrice; // オプション料金は既に各車両の合計なので、車両数で掛けない
    const miscTotal = miscFee * cars.length;

    const resaleCount = Math.max(cars.length - 1, 0);
    const resaleTotal = 1450000 * resaleCount;

    const totalBeforeResale = carPriceTotal + taxTotal + optionTotal + miscTotal;
    const totalPurchase = totalBeforeResale - resaleTotal;

    const leaseBreakdown = cars.map((c, idx) => {
      const m = modelMap.get(c.modelId!);
      const monthly = m?.monthly ?? 0;
      const months = getLeaseMonths(cars.length, idx);
      return { label: `${idx + 1}台目`, total: monthly * months };
    });

    const tfvTotal = leaseBreakdown.reduce((s, l) => s + l.total, 0);
    const savings = totalPurchase - tfvTotal;

    return {
      carPriceTotal,
      taxTotal,
      optionTotal,
      miscTotal,
      totalPurchase,
      tfvTotal,
      leaseBreakdown,
      resaleCount,
      resaleTotal,
      savings,
    };
  };

  return useMemo(() => ({ calculate }), [cars, modelMap, optionPrice, miscFee]);
}

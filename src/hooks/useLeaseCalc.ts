"use client";

import { useMemo } from "react";
import { CalcResult, CarRow, RecommendedCar, CarOption } from "@/types/cars";
import { getLeaseMonths, isResaleTarget } from "@/utils/lease";
import { PlanKey } from "@/types/plan";

type Args = {
  cars: CarRow[];
  modelMap: Map<string, RecommendedCar>;
  carOptionsArray: [number, CarOption[]][];
  miscFee: number;
  plan: PlanKey;
  carResalePrices: [number, number][];
  carAdditionalMonthlyPrices: [number, number][];
  overrideOptionTotal?: number;
};

export function useLeaseCalc({ cars, modelMap, carOptionsArray, miscFee, plan, carResalePrices, carAdditionalMonthlyPrices, overrideOptionTotal }: Args) {
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

    // オプション合計を計算
    const optionTotal = overrideOptionTotal !== undefined 
      ? overrideOptionTotal 
      : Array.from(new Map(carOptionsArray).values()).reduce((sum: number, carOptions: CarOption[]) => {
          return sum + carOptions.reduce((carSum, carOption) => {
            return carSum + (carOption?.price || 0);
          }, 0);
        }, 0);
    const miscTotal = miscFee * cars.length;

    // 売却額の計算（売却対象の車両のみ）
    const resalePricesMap = new Map(carResalePrices);
    let resaleCount = 0;
    let resaleTotal = 0;
    
    cars.forEach((car, index) => {
      if (isResaleTarget(cars.length, index)) {
        const resalePrice = resalePricesMap.get(car.id) || 0;
        resaleTotal += resalePrice;
        resaleCount++;
      }
    });

    const totalBeforeResale = carPriceTotal + taxTotal + optionTotal + miscTotal;
    const totalPurchase = totalBeforeResale - resaleTotal;

    const additionalMonthlyPricesMap = new Map(carAdditionalMonthlyPrices);
    const leaseBreakdown = cars.map((c, idx) => {
      const m = modelMap.get(c.modelId!);
      const baseMonthly = plan === 'j7' ? (m?.monthly7 ?? 0) : (m?.monthly9 ?? 0);
      const additionalMonthly = additionalMonthlyPricesMap.get(c.id) || 0;
      const monthly = baseMonthly + additionalMonthly;
      const months = getLeaseMonths(cars.length, idx, plan);
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

  return useMemo(() => ({ calculate }), [cars, modelMap, carOptionsArray, miscFee, plan, carResalePrices, carAdditionalMonthlyPrices, overrideOptionTotal, calculate]);
}

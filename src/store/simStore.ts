"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CarRow, CalcResult } from "@/types/cars";
import { PlanKey } from "@/types/plan";

type SimState = {
  plan: PlanKey | null;
  cars: CarRow[];
  optionPrice: number;
  miscFee: number;
  carOptionPricesArray: [number, number][]; // Mapを配列として保存
  result: CalcResult | null;

  setPlan: (p: PlanKey) => void;
  setCars: (cars: CarRow[]) => void;
  setOptionPrice: (v: number) => void;
  setMiscFee: (v: number) => void;
  setCarOptionPrices: (prices: Map<number, number>) => void;
  setResult: (r: CalcResult | null) => void;
  reset: () => void;
};

export const useSimStore = create<SimState>()(
  persist(
    (set) => ({
      plan: null,
      cars: [],
      optionPrice: 300000,
      miscFee: 70000,
      carOptionPricesArray: [],
      result: null,
      setPlan: (p) => set({ plan: p }),
      setCars: (cars) => set({ cars }),
      setOptionPrice: (v) => set({ optionPrice: v }),
      setMiscFee: (v) => set({ miscFee: v }),
      setCarOptionPrices: (prices) => set({ carOptionPricesArray: Array.from(prices.entries()) }),
      setResult: (r) => set({ result: r }),
      reset: () =>
        set({
          cars: [],
          carOptionPricesArray: [],
          result: null,
        }),
    }),
    { name: "sim-state" }
  )
);

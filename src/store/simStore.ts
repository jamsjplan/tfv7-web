"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CarRow, CalcResult } from "@/types/cars";
import { PlanKey } from "@/types/plan";

type CarOption = {
  id: string;
  name: string;
  price: number;
};

type SimState = {
  plan: PlanKey | null;
  cars: CarRow[];
  optionPrice: number;
  miscFee: number;
  carOptionsArray: [number, CarOption[]][]; // 車両IDとオプションの配列
  carResalePrices: [number, number][]; // 車両IDと売却額の配列
  carAdditionalMonthlyPrices: [number, number][]; // 車両IDと追加月額料金の配列
  result: CalcResult | null;

  setPlan: (p: PlanKey) => void;
  setCars: (cars: CarRow[]) => void;
  setOptionPrice: (v: number) => void;
  setMiscFee: (v: number) => void;
  addCarOption: (carId: number, option: CarOption) => void;
  removeCarOption: (carId: number, optionId: string) => void;
  removeAllCarOptions: (carId: number) => void;
  setCarResalePrice: (carId: number, resalePrice: number) => void;
  removeCarResalePrice: (carId: number) => void;
  setCarAdditionalMonthlyPrice: (carId: number, additionalMonthlyPrice: number) => void;
  removeCarAdditionalMonthlyPrice: (carId: number) => void;
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
      carOptionsArray: [],
      carResalePrices: [],
      carAdditionalMonthlyPrices: [],
      result: null,
      setPlan: (p) => set({ plan: p }),
      setCars: (cars) => set({ cars }),
      setOptionPrice: (v) => set({ optionPrice: v }),
      setMiscFee: (v) => set({ miscFee: v }),
      addCarOption: (carId, option) => set((state) => {
        const existingIndex = state.carOptionsArray.findIndex(([id]) => id === carId);
        if (existingIndex >= 0) {
          const newArray = [...state.carOptionsArray];
          newArray[existingIndex][1].push(option);
          return { carOptionsArray: newArray };
        } else {
          return { carOptionsArray: [...state.carOptionsArray, [carId, [option]]] };
        }
      }),
      removeCarOption: (carId, optionId) => set((state) => {
        const newArray = state.carOptionsArray.map(([id, options]) => {
          if (id === carId) {
            const filteredOptions = options.filter(opt => opt.id !== optionId);
            return [id, filteredOptions] as [number, CarOption[]];
          }
          return [id, options] as [number, CarOption[]];
        }).filter(([, options]) => options.length > 0);
        return { carOptionsArray: newArray };
      }),
      removeAllCarOptions: (carId) => set((state) => ({
        carOptionsArray: state.carOptionsArray.filter(([id]) => id !== carId)
      })),
      setCarResalePrice: (carId, resalePrice) => set((state) => {
        const existingIndex = state.carResalePrices.findIndex(([id]) => id === carId);
        if (existingIndex >= 0) {
          const newArray = [...state.carResalePrices];
          newArray[existingIndex] = [carId, resalePrice];
          return { carResalePrices: newArray };
        } else {
          return { carResalePrices: [...state.carResalePrices, [carId, resalePrice]] };
        }
      }),
      removeCarResalePrice: (carId) => set((state) => ({
        carResalePrices: state.carResalePrices.filter(([id]) => id !== carId)
      })),
      setCarAdditionalMonthlyPrice: (carId, additionalMonthlyPrice) => set((state) => {
        const existingIndex = state.carAdditionalMonthlyPrices.findIndex(([id]) => id === carId);
        if (existingIndex >= 0) {
          const newArray = [...state.carAdditionalMonthlyPrices];
          newArray[existingIndex] = [carId, additionalMonthlyPrice];
          return { carAdditionalMonthlyPrices: newArray };
        } else {
          return { carAdditionalMonthlyPrices: [...state.carAdditionalMonthlyPrices, [carId, additionalMonthlyPrice]] };
        }
      }),
      removeCarAdditionalMonthlyPrice: (carId) => set((state) => ({
        carAdditionalMonthlyPrices: state.carAdditionalMonthlyPrices.filter(([id]) => id !== carId)
      })),
      setResult: (r) => set({ result: r }),
      reset: () =>
        set({
          cars: [],
          carOptionsArray: [],
          carResalePrices: [],
          carAdditionalMonthlyPrices: [],
          result: null,
        }),
    }),
    { name: "sim-state" }
  )
);

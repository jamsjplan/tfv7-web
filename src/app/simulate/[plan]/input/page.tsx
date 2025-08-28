"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { RECOMMENDED } from "@/data/recommended";
import { RecommendedCar, CarRow } from "@/types/cars";
import { PLAN_LABEL, PlanKey } from "@/types/plan";
import { getLeaseMonths, getMaxCars, getTotalLeaseMonths } from "@/utils/lease";
import CarCard from "@/components/CarCard";
import PickerModal from "@/components/PickerModal";
import AddButton from "@/components/AddButton";
import { useLeaseCalc } from "@/hooks/useLeaseCalc";
import { useSimStore } from "@/store/simStore";

export default function InputPage() {
  const params = useParams<{ plan: string }>();
  const plan = params.plan as PlanKey;
  if (!["j7", "j9"].includes(plan)) notFound();

  const router = useRouter();
  const { cars, optionPrice, miscFee, carOptionPricesArray, setCars, setResult, setPlan, setCarOptionPrices } = useSimStore();
  
  // 配列からMapに変換
  const storeCarOptionPrices = useMemo(() => new Map(carOptionPricesArray), [carOptionPricesArray]);

  // ページ直進/切替時にプランを保存（結果は引き継ぎたいので触らない）
  useEffect(() => {
    setPlan(plan);
  }, [plan, setPlan]);

  const nextId = useRef(1);
  
  // ストアからオプション料金を取得、ローカル状態は削除
  
  // 車両が追加されるたびに、既存のIDの最大値+1を計算
  useEffect(() => {
    if (cars.length > 0) {
      const ids = cars.map((c) => c.id).filter(id => typeof id === 'number');
      if (ids.length > 0) {
        const maxId = Math.max(...ids);
        nextId.current = maxId + 1;
        
        // デバッグ: IDの重複チェック
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
          console.warn('重複したIDが検出されました:', ids);
        }
      }
    } else {
      nextId.current = 1;
    }
  }, [cars]);
  const [pickerOpenFor, setPickerOpenFor] = useState<number | "new" | null>(null);

  // プラン別に初期値を微調整したい場合はここで
  // 例: Jナイン/Jプレミアムはオプション費用を変える…など
  // 今回は共通設定のまま

  const modelMap = useMemo(() => {
    const map = new Map<string, RecommendedCar>();
    for (const c of RECOMMENDED) map.set(c.id, c);
    return map;
  }, []);

  // 各車両のオプション料金の合計を計算
  const totalOptionPrice = Array.from(storeCarOptionPrices.values()).reduce((sum: number, price: number) => sum + price, 0);

  const { calculate } = useLeaseCalc({ cars, modelMap, optionPrice: totalOptionPrice, miscFee });

  const handleRemoveCar = (id: number) => {
    setCars(cars.filter((c) => c.id !== id));
    // オプション料金も削除
    const newOptionPrices = new Map(storeCarOptionPrices);
    newOptionPrices.delete(id);
    setCarOptionPrices(newOptionPrices);
  };

  const openPickerForNew = () => setPickerOpenFor("new");
  const openPickerFor = (id: number) => setPickerOpenFor(id);
  const closePicker = () => setPickerOpenFor(null);

  const handleSelectModel = (modelId: string) => {
    if (pickerOpenFor === "new") {
      const newId = nextId.current;
      nextId.current += 1;
      setCars([...cars, { id: newId, modelId }]);
      // 新しい車両のオプション料金を0で初期化
      const newOptionPrices = new Map(storeCarOptionPrices).set(newId, 0);
      console.log(`新しい車両ID ${newId} を追加、オプション料金を0で初期化`);
      console.log('更新後のオプション料金マップ:', Array.from(newOptionPrices.entries()));
      setCarOptionPrices(newOptionPrices);
    } else if (typeof pickerOpenFor === "number") {
      setCars(cars.map((c) => (c.id === pickerOpenFor ? { ...c, modelId } : c)));
    }
    setPickerOpenFor(null);
  };

  const handleOptionPriceChange = (carId: number, price: number) => {
    console.log(`車両ID ${carId} のオプション料金を ${price} に変更`);
    const newOptionPrices = new Map(storeCarOptionPrices).set(carId, price);
    console.log('更新後のオプション料金マップ:', Array.from(newOptionPrices.entries()));
    setCarOptionPrices(newOptionPrices);
  };

  const canCalc = cars.length > 0 && cars.every((c) => !!c.modelId);
  
  const handleCalcAndGo = () => {
    const res = calculate();
    setResult(res);
    router.push(`/simulate/${plan}/result`);
  };

  return (
    <div className="bg-[#f4f3f0] min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-3">
          <div className="text-sm text-gray-500">ステップ 1 / 2</div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
            {PLAN_LABEL[plan]}｜情報入力
          </h1>
          <div className="border-b-2 border-[#fc844f] mt-1 mb-2"></div>
          <p className="text-sm text-gray-600">車両を選択して「計算へ」を押してください。</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {cars.map((car, index) => {
            const selected = car.modelId ? modelMap.get(car.modelId) : undefined;
            const leaseMonths = getLeaseMonths(cars.length, index, plan);
            const optionPrice = storeCarOptionPrices.get(car.id) || 0;
            return (
              <CarCard
                key={car.id}
                selected={selected}
                leaseMonths={leaseMonths}
                optionPrice={optionPrice}
                onPick={() => openPickerFor(car.id)}
                onRemove={() => handleRemoveCar(car.id)}
                onOptionPriceChange={(price) => handleOptionPriceChange(car.id, price)}
              />
            );
          })}
          {cars.length < getMaxCars(plan) && <AddButton onClick={openPickerForNew} />}
        </div>

        <button
          onClick={handleCalcAndGo}
          disabled={!canCalc}
          className={`w-full rounded-[30px] text-white text-[1.6rem] py-3 px-8 ${
            !canCalc ? "bg-gray-400 cursor-not-allowed" : "bg-[#fc844f] hover:opacity-80 cursor-pointer"
          }`}
        >
          計算へ
        </button>

        <PickerModal
          open={pickerOpenFor !== null}
          onClose={closePicker}
          list={RECOMMENDED}
          onSelect={handleSelectModel}
        />
      </div>
    </div>
  );
}

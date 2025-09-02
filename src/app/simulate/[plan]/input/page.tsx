"use client";

export const runtime = 'edge';

import { useEffect, useMemo, useRef, useState } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { RECOMMENDED } from "@/data/recommended";
import { RecommendedCar, CarRow, CarOption } from "@/types/cars";
import { PLAN_LABEL, PlanKey } from "@/types/plan";
import { getLeaseMonths, getMaxCars, isResaleTarget } from "@/utils/lease";
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
  const { cars, miscFee, carOptionsArray, carResalePrices, carAdditionalMonthlyPrices, setCars, setResult, setPlan, addCarOption, removeCarOption, removeAllCarOptions, setCarResalePrice, removeCarResalePrice, setCarAdditionalMonthlyPrice, removeCarAdditionalMonthlyPrice } = useSimStore();
  
  // 配列からMapに変換
  const storeCarOptions = useMemo(() => new Map(carOptionsArray), [carOptionsArray]);

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



  const [overrideOptionTotal, setOverrideOptionTotal] = useState<number | undefined>(undefined);
  const [shouldCalculate, setShouldCalculate] = useState<boolean>(false);
  
  const { calculate } = useLeaseCalc({ cars, modelMap, carOptionsArray, miscFee, plan, carResalePrices, carAdditionalMonthlyPrices, overrideOptionTotal });

  // overrideOptionTotalが更新された時に計算を実行
  useEffect(() => {
    if (shouldCalculate && overrideOptionTotal !== undefined) {
      const res = calculate();
      setResult(res);
      router.push(`/simulate/${plan}/result`);
      setShouldCalculate(false);
      setOverrideOptionTotal(undefined);
    }
  }, [overrideOptionTotal, shouldCalculate, calculate, setResult, router, plan]);

  const handleRemoveCar = (id: number) => {
    setCars(cars.filter((c) => c.id !== id));
    // 車両削除時にオプションと売却額も削除
    removeAllCarOptions(id);
    removeCarResalePrice(id);
    removeCarAdditionalMonthlyPrice(id);
  };

  const openPickerForNew = () => setPickerOpenFor("new");
  const openPickerFor = (id: number) => setPickerOpenFor(id);
  const closePicker = () => setPickerOpenFor(null);

  const handleSelectModel = (modelId: string) => {
    if (pickerOpenFor === "new") {
      const newId = nextId.current;
      nextId.current += 1;
      setCars([...cars, { id: newId, modelId }]);
    } else if (typeof pickerOpenFor === "number") {
      setCars(cars.map((c) => (c.id === pickerOpenFor ? { ...c, modelId } : c)));
    }
    setPickerOpenFor(null);
  };

  const handleAddOption = (carId: number, name: string, price: number) => {
    const optionId = `${carId}_${Date.now()}`; // 一意のIDを生成
    console.log(`オプション追加: 車両ID=${carId}, 名前=${name}, 価格=${price}`);
    addCarOption(carId, { id: optionId, name, price });
  };

  const handleRemoveOption = (carId: number, optionId: string) => {
    console.log(`オプション削除: 車両ID=${carId}, オプションID=${optionId}`);
    removeCarOption(carId, optionId);
  };



  const handleUpdateMonthlyPrice = (carId: number, additionalMonthlyPrice: number) => {
    setCarAdditionalMonthlyPrice(carId, additionalMonthlyPrice);
    console.log(`車両ID ${carId} の追加月額料金: ¥${additionalMonthlyPrice.toLocaleString()}`);
  };

  const handleUpdateResalePrice = (carId: number, resalePrice: number) => {
    setCarResalePrice(carId, resalePrice);
  };

  // 売却額の検証関数を管理するMap
  const resalePriceValidators = useRef(new Map<number, () => boolean>());
  
  // 入力フィールドの取得関数を管理するMap
  const inputFieldsGetters = useRef(new Map<number, () => Array<{ id: string; name: string; price: string }>>());

  const handleValidateResalePrice = (carId: number, validateFn: () => boolean) => {
    resalePriceValidators.current.set(carId, validateFn);
  };

  const handleGetInputFields = (carId: number, getFieldsFn: () => Array<{ id: string; name: string; price: string }>) => {
    inputFieldsGetters.current.set(carId, getFieldsFn);
  };

  const handleCopyFirstCarOptions = (targetCarId: number) => {
    // 1台目の車両IDを取得
    const firstCar = cars[0];
    if (!firstCar) return;

    // 1台目のオプションを取得
    const firstCarOptions = storeCarOptions.get(firstCar.id) || [];
    
    // 対象車両の既存オプションを削除
    removeAllCarOptions(targetCarId);
    
    // 1台目のオプションを対象車両にコピー
    firstCarOptions.forEach(option => {
      addCarOption(targetCarId, {
        id: `copied_${Date.now()}_${Math.random()}`,
        name: option.name,
        price: option.price
      });
    });
  };

  const canCalc = cars.length > 0 && cars.every((c) => !!c.modelId);

  const handleCalcAndGo = () => {
    // 全体のオプション合計を計算
    let totalOptionPrice = 0;
    
    // 各車両のオプション料金を自動反映
    cars.forEach(car => {
      // 入力フィールドから直接オプション情報を取得
      const getFieldsFn = inputFieldsGetters.current.get(car.id);
      if (!getFieldsFn) return;
      
      const inputFields = getFieldsFn();
      
      // 既存のオプションをすべて削除
      removeAllCarOptions(car.id);
      
      // 価格が入力されているフィールドのみ処理
      let carOptionPrice = 0;
      inputFields.forEach(fieldData => {
        if (Number(fieldData.price) > 0) {
          const optionName = fieldData.name.trim();
          const optionPrice = Number(fieldData.price);
          addCarOption(car.id, {
            id: `calc_${Date.now()}_${Math.random()}`,
            name: optionName,
            price: optionPrice
          });
          carOptionPrice += optionPrice;
        }
      });
      
      totalOptionPrice += carOptionPrice;
      
      // オプション料金を月額に加算（継承するリース期間で割る）
      const carIndex = cars.findIndex(c => c.id === car.id);
      const leaseMonths = getLeaseMonths(cars.length, carIndex, plan);
      if (carOptionPrice > 0 && leaseMonths > 0) {
        const additionalMonthlyPrice = Math.floor(carOptionPrice / leaseMonths);
        handleUpdateMonthlyPrice(car.id, additionalMonthlyPrice);
      } else {
        handleUpdateMonthlyPrice(car.id, 0);
      }
    });
    
    // 売却対象の車両のみ売却額の検証
    let hasErrors = false;
    for (const [carId, validateFn] of resalePriceValidators.current) {
      const carIndex = cars.findIndex(c => c.id === carId);
      if (carIndex >= 0 && isResaleTarget(cars.length, carIndex)) {
        if (!validateFn()) {
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      return; // エラーがある場合は処理を中断
    }

    // オプション合計を設定して計算を実行
    setOverrideOptionTotal(totalOptionPrice);
    setShouldCalculate(true);
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
          <p className="text-sm text-gray-600">車両・オプション・売却額を設定して「計算する」を押してください。</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {cars.map((car, index) => {
            const selected = car.modelId ? modelMap.get(car.modelId) : undefined;
            const leaseMonths = getLeaseMonths(cars.length, index, plan);
            const carOptions = storeCarOptions.get(car.id) || [];
            const optionPrice = carOptions.reduce((sum, option) => {
              const price = typeof option?.price === 'number' ? option.price : 0;
              return sum + price;
            }, 0);
            console.log(`車両ID ${car.id} のオプション:`, carOptions, `合計: ${optionPrice}`);
            return (
              <CarCard
                key={car.id}
                selected={selected}
                leaseMonths={leaseMonths}
                optionPrice={optionPrice}
                carOptions={carOptions}
                plan={plan}
                totalCars={cars.length}
                carIndex={cars.findIndex(c => c.id === car.id)}
                carId={car.id}
                onPick={() => openPickerFor(car.id)}
                onRemove={() => handleRemoveCar(car.id)}
                onAddOption={(name, price) => handleAddOption(car.id, name, price)}
                onRemoveOption={(optionId) => handleRemoveOption(car.id, optionId)}

                onUpdateMonthlyPrice={handleUpdateMonthlyPrice}
                onUpdateResalePrice={handleUpdateResalePrice}
                onValidateResalePrice={handleValidateResalePrice}
                onCopyFirstCarOptions={handleCopyFirstCarOptions}
                onGetInputFields={handleGetInputFields}
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
          計算する
        </button>

        <PickerModal
          open={pickerOpenFor !== null}
          onClose={closePicker}
          list={RECOMMENDED}
          onSelect={handleSelectModel}
          plan={plan}
        />


      </div>
    </div>
  );
}

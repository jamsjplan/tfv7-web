"use client";

import React, { useState, useEffect, useRef } from "react";
import { RecommendedCar } from "@/types/cars";
import { PlanKey } from "@/types/plan";
import { useSimStore } from "@/store/simStore";
import { isResaleTarget } from "@/utils/lease";

type CarOption = {
  id: string;
  name: string;
  price: number;
};

type Props = {
  selected?: RecommendedCar;
  leaseMonths: number;
  optionPrice: number;
  carOptions: CarOption[];
  plan: PlanKey;
  totalCars: number;
  carIndex: number;
  onPick: () => void;
  onRemove: () => void;
  onAddOption: (name: string, price: number) => void;
  onRemoveOption: (optionId: string) => void;
  onUpdateOption: (optionId: string, name: string, price: number) => void;
  onUpdateMonthlyPrice: (carId: number, additionalMonthlyPrice: number) => void;
  onUpdateResalePrice: (carId: number, resalePrice: number) => void;
  onValidateResalePrice: (carId: number, validateFn: () => boolean) => void;
  onCopyFirstCarOptions: (targetCarId: number) => void;
  onGetInputFields?: (carId: number, getFieldsFn: () => Array<{ id: string; name: string; price: string }>) => void;
  carId: number;
};

export default function CarCard({ selected, leaseMonths, optionPrice, carOptions, plan, totalCars, carIndex, onPick, onRemove, onAddOption, onRemoveOption, onUpdateOption, onUpdateMonthlyPrice, onUpdateResalePrice, onValidateResalePrice, onCopyFirstCarOptions, onGetInputFields, carId }: Props) {
  const { carResalePrices, carAdditionalMonthlyPrices } = useSimStore();
  const [inputFields, setInputFields] = useState<Array<{ id: string; name: string; price: string }>>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});
  const [additionalMonthlyPrice, setAdditionalMonthlyPrice] = useState<number>(0);
  const [resalePrice, setResalePrice] = useState<string>("");
  const [resalePriceError, setResalePriceError] = useState<boolean>(false);
  const resalePriceInputRef = useRef<HTMLInputElement>(null);

  // 売却対象かどうかを判定
  const isResale = isResaleTarget(totalCars, carIndex, plan);

  // オプションフィールドと売却額をZustandストアから復元
  useEffect(() => {
    // オプションフィールドを復元
    if (carOptions.length > 0) {
      const fields = carOptions.map((option, index) => ({
        id: `restored_${index}`,
        name: option.name || '',
        price: option.price.toString()
      }));
      setInputFields(fields);

      // 追加月額料金も復元（ストアから取得）
      const additionalMonthlyPricesMap = new Map(carAdditionalMonthlyPrices);
      const storedAdditionalMonthlyPrice = additionalMonthlyPricesMap.get(carId);
      if (storedAdditionalMonthlyPrice !== undefined) {
        setAdditionalMonthlyPrice(storedAdditionalMonthlyPrice);
      } else {
        // ストアに保存されていない場合は、オプションから計算
        const totalOptionPrice = carOptions.reduce((sum, option) => sum + option.price, 0);
        if (totalOptionPrice > 0 && leaseMonths > 0) {
          const additionalMonthly = Math.floor(totalOptionPrice / leaseMonths);
          setAdditionalMonthlyPrice(additionalMonthly);
        }
      }
    }

    // 売却額を復元
    const resalePricesMap = new Map(carResalePrices);
    const savedResalePrice = resalePricesMap.get(carId);
    if (savedResalePrice && savedResalePrice > 0) {
      setResalePrice(savedResalePrice.toString());
    }
  }, [carOptions, carResalePrices, carAdditionalMonthlyPrices, carId, leaseMonths]);

  const addInputField = () => {
    const newField = {
      id: `input_${Date.now()}`,
      name: "",
      price: ""
    };
    setInputFields([...inputFields, newField]);
  };

  const removeInputField = (fieldId: string) => {
    setInputFields(inputFields.filter(field => field.id !== fieldId));
  };

  const updateInputField = (fieldId: string, field: 'name' | 'price', value: string) => {
    setInputFields(inputFields.map(f =>
      f.id === fieldId ? { ...f, [field]: value } : f
    ));
    
    // 入力時にエラー状態をクリア
    if (field === 'price' && fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleResalePriceChange = (value: string) => {
    setResalePrice(value);
    const price = Number(value) || 0;
    onUpdateResalePrice(carId, price);
    
    // 入力時にエラー状態をクリア
    if (resalePriceError) {
      setResalePriceError(false);
    }
  };

  // 売却額の検証関数
  const validateResalePrice = (): boolean => {
    if (!resalePrice || Number(resalePrice) <= 0) {
      setResalePriceError(true);
      // エラー時にフォーカスを当てる
      setTimeout(() => {
        resalePriceInputRef.current?.focus();
      }, 100);
      return false;
    }
    setResalePriceError(false);
    return true;
  };

  // 親コンポーネントに検証関数を登録
  React.useEffect(() => {
    onValidateResalePrice(carId, validateResalePrice);
  }, [carId, onValidateResalePrice, resalePrice]);

  // 入力フィールドの取得関数を親に登録
  React.useEffect(() => {
    if (onGetInputFields) {
      onGetInputFields(carId, () => inputFields);
    }
  }, [carId, onGetInputFields, inputFields]);



  // オプション料金反映ボタンを押したときにデータを反映
  const handleApplyOptions = () => {
    // エラー状態をリセット
    setFieldErrors({});
    
    // 価格が入力されていないフィールドをチェック
    const errors: { [key: string]: boolean } = {};
    let hasErrors = false;
    
    inputFields.forEach(field => {
      if (!field.price || Number(field.price) <= 0) {
        errors[field.id] = true;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    // 既存のオプションをすべて削除
    carOptions.forEach(option => {
      onRemoveOption(option.id);
    });

    // 入力欄の内容を新しいオプションとして追加（オプション名は任意）
    let totalOptionPrice = 0;
    inputFields.forEach(fieldData => {
      if (Number(fieldData.price) > 0) {
        const optionName = fieldData.name.trim();
        const optionPrice = Number(fieldData.price);
        onAddOption(optionName, optionPrice);
        totalOptionPrice += optionPrice;
      }
    });

    // オプション料金を月額に加算（継承するリース期間で割る）
    if (totalOptionPrice > 0 && leaseMonths > 0) {
      const newAdditionalMonthlyPrice = Math.floor(totalOptionPrice / leaseMonths);
      setAdditionalMonthlyPrice(newAdditionalMonthlyPrice);
      onUpdateMonthlyPrice(carId, newAdditionalMonthlyPrice);
    } else {
      setAdditionalMonthlyPrice(0);
      onUpdateMonthlyPrice(carId, 0);
    }
  };
  return (
    <div className="rounded-2xl bg-white shadow p-6">
      <div className="flex justify-between items-start mb-4 relative">
        <div className="font-bold text-gray-900 text-base sm:text-lg md:text-xl lg:text-2xl leading-tight break-words pr-10">
          {selected ? `${selected.maker}｜${selected.name}` : "（車種未選択）"}
        </div>
        <button
          onClick={onRemove}
          aria-label="車両を削除"
          className="absolute top-0 right-0 p-1 sm:p-2 text-gray-500 hover:text-[#fc844f] cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2"
               className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 7h12M9 7V4h6v3m-9 4h12l-1 9H8l-1-9z" />
          </svg>
        </button>
      </div>

      <div className="flex gap-4 items-start">
        <div className="shrink-0 self-start">
          {selected?.imageUrl ? (
            <img
              src={selected.imageUrl}
              alt={selected.name}
              className="w-32 h-24 sm:w-44 sm:h-32 md:w-56 md:h-40 object-contain bg-white rounded-lg"
            />
          ) : (
            <div className="w-32 h-24 sm:w-44 sm:h-32 md:w-56 md:h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
              画像
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="text-xs sm:text-sm text-[#fc844f] font-semibold">月額（税込）</div>
          <div className="flex items-end gap-1 sm:text-sm md:text-base">
            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#fc844f] leading-none">
              ¥{selected ? ((plan === 'j7' ? selected.monthly7 : selected.monthly9) + additionalMonthlyPrice).toLocaleString() : "―"}
            </div>
            {additionalMonthlyPrice > 0 && (
              <div className="text-xs text-gray-500 ml-1">
                (+¥{additionalMonthlyPrice.toLocaleString()})
              </div>
            )}
          </div>

          {/* オプション料金表示 */}
          {selected && (
            <div className="mt-3 relative">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <div className="w-1 h-4 bg-[#fc844f] mr-2"></div>
                  <span>オプション設定</span>
                </div>
                {carIndex > 0 && (
                  <button
                    onClick={() => onCopyFirstCarOptions(carId)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    1台目のオプションをコピーする
                  </button>
                )}
              </div>

                            {/* オプション入力フォーム */}
              <div className="space-y-3">
                {/* 入力欄一覧 */}
                {inputFields.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    オプションを追加するには「入力欄を追加」ボタンをクリックしてください
                  </div>
                ) : (
                  inputFields.map((field) => (
                   <div key={field.id} className="space-y-1">
                     <div className="flex items-center gap-3">
                       <div className="flex-1 flex gap-2">
                         <input
                           type="text"
                           value={field.name}
                           onChange={(e) => updateInputField(field.id, 'name', e.target.value)}
                           className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                           placeholder={field.name === '' ? "オプション名（任意）" : ""}
                         />
                         <input
                           type="number"
                           value={field.price}
                           onChange={(e) => updateInputField(field.id, 'price', e.target.value)}
                           onWheel={(e) => e.currentTarget.blur()}
                           className={`flex-[1] px-3 py-2 text-sm border rounded-md focus:outline-none ${
                             fieldErrors[field.id] 
                               ? 'border-red-500 bg-red-50 focus:border-red-500' 
                               : 'border-gray-300 focus:border-orange-500'
                           }`}
                           placeholder="税込価格（必須）"
                           min="0"
                           required
                         />
                       </div>
                                               <button
                          onClick={() => removeInputField(field.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-400 hover:text-gray-900 hover:translate-y-0.5 transition-all cursor-pointer"
                        >
                         <span className="w-4 h-4 flex items-center justify-center bg-white text-gray-700 rounded-full text-xs font-bold">−</span>
                         入力欄を削除
                       </button>
                     </div>
                     {fieldErrors[field.id] && (
                       <div className="text-red-500 text-xs ml-2">
                         価格を入力してください
                       </div>
                     )}
                   </div>
                 ))
                )}

                {/* 入力欄追加ボタンと反映ボタン */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={addInputField}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-transparent rounded-md hover:bg-gray-100 hover:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span className="h-4 flex items-center justify-center bg-white text-gray-700 rounded-full text-xs font-bold">+</span>
                    入力欄を追加
                  </button>
                  <button
                    onClick={handleApplyOptions}
                    className="px-3 py-2 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600 hover:translate-y-0.5 transition-all cursor-pointer"
                  >
                    オプション料金反映
                  </button>
                </div>

                {/* 合計金額表示 */}
                <div className="text-right">
                  <span className="text-sm">
                    <span className="text-gray-600">オプション料金合計：</span>
                    <span className="text-[#fc844f]">¥{(optionPrice || 0).toLocaleString()}（税込）</span>
                  </span>
                </div>
           </div>

           {/* 売却額設定 */}
           {selected && isResale && (
             <div className="mt-4 relative">
               <div className="mb-2">
                 <div className="flex items-center text-xs sm:text-sm text-gray-600">
                   <div className="w-1 h-4 bg-[#fc844f] mr-2"></div>
                   <span>売却額設定</span>
                 </div>
               </div>
               
               <div className="space-y-1">
                 <div className="flex items-center gap-3">
                                    <div className="flex-1">
                   <input
                     ref={resalePriceInputRef}
                     type="number"
                     value={resalePrice}
                     onChange={(e) => handleResalePriceChange(e.target.value)}
                     onWheel={(e) => e.currentTarget.blur()}
                     className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none ${
                       resalePriceError 
                         ? 'border-red-500 bg-red-50 focus:border-red-500' 
                         : 'border-gray-300 focus:border-orange-500'
                     }`}
                     placeholder="売却額（円）"
                     min="0"
                     required
                   />
                 </div>
                   <div className="text-sm text-gray-500">
                     円
                   </div>
                                  </div>
                 {resalePriceError && (
                   <div className="text-red-500 text-xs ml-2">
                     価格を入力してください
                   </div>
                 )}
            </div>
          </div>
           )}
              </div>
            )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm md:text-base">
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs md:text-sm px-2 py-0.5 rounded mr-2">グレード</span>
          <span className="text-gray-800">{selected?.grade ?? "―"}</span>
        </div>
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs md:text-sm px-2 py-0.5 rounded mr-2">乗車人数</span>
          <span className="text-gray-800">{selected?.people ?? "―"}人</span>
        </div>
      </div>

      <div className="mt-4 flex pt-4 border-t">
        <div className="flex-1 pr-4">
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-500">継承するリース期間</div>
          <div className="text-sm sm:text-base md:text-lg text-gray-800 mt-1">
            {leaseMonths > 0 ? `${leaseMonths}ヶ月` : "—"}
          </div>
        </div>
        <div className="w-px bg-gray-300 mx-4" />
        <div className="flex-1 pl-4">
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-500">参考：本体価格（税抜）</div>
          <div className="text-sm sm:text-base md:text-lg text-gray-800 mt-1">
            {selected?.fullprice && selected.fullprice > 0 ? `¥${selected.fullprice.toLocaleString()}` : "—"}
          </div>
        </div>
      </div>

      <div
        onClick={onPick}
        className="mt-3 text-xs sm:text-sm text-indigo-600 hover:underline cursor-pointer text-right"
      >
        &lt; 車種を選び直す
      </div>
    </div>
  );
}

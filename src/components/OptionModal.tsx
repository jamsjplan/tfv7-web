"use client";

import { useState } from "react";
import { Option, CarOption } from "@/types/cars";
import { OPTIONS } from "@/data/options";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedOptions: CarOption[];
  onSelect: (options: CarOption[]) => void;
};

export default function OptionModal({ open, onClose, selectedOptions, onSelect }: Props) {
  const [tempOptions, setTempOptions] = useState<CarOption[]>(selectedOptions);

  if (!open) return null;

  const handleQuantityChange = (optionId: string, quantity: number) => {
    if (quantity <= 0) {
      setTempOptions(tempOptions.filter(opt => opt.id !== optionId));
    } else {
      const existingIndex = tempOptions.findIndex(opt => opt.id === optionId);
      if (existingIndex >= 0) {
        const newOptions = [...tempOptions];
        newOptions[existingIndex] = { id: optionId, name: '', price: 0 };
        setTempOptions(newOptions);
      } else {
        setTempOptions([...tempOptions, { id: optionId, name: '', price: 0 }]);
      }
    }
  };

  const getQuantity = (optionId: string) => {
    const option = tempOptions.find(opt => opt.id === optionId);
    return option ? 1 : 0;
  };

  const getTotalPrice = () => {
    return tempOptions.reduce((total, carOption) => {
      const option = OPTIONS.find(opt => opt.id === carOption.id);
      return total + (option ? option.price : 0);
    }, 0);
  };

  const handleConfirm = () => {
    onSelect(tempOptions);
    onClose();
  };

  const handleCancel = () => {
    setTempOptions(selectedOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
      <div className="relative bg-white shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">オプション選択</h3>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {OPTIONS.map((option) => {
            const quantity = getQuantity(option.id);
            return (
              <div key={option.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{option.name}</h4>
                    {option.description && (
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#fc844f]">
                      ¥{option.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-600">数量:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(option.id, quantity - 1)}
                      disabled={quantity <= 0}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(option.id, quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {quantity > 0 && (
                  <div className="mt-2 text-right text-sm text-gray-600">
                    小計: ¥{(option.price * quantity).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">合計金額:</span>
            <span className="text-2xl font-bold text-[#fc844f]">
              ¥{getTotalPrice().toLocaleString()}
            </span>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-[#fc844f] text-white rounded-lg hover:opacity-80"
            >
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

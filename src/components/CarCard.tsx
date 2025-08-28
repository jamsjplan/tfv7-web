"use client";

import { RecommendedCar } from "@/types/cars";

type Props = {
  selected?: RecommendedCar;
  leaseMonths: number;
  optionPrice: number;
  onPick: () => void;
  onRemove: () => void;
  onOptionPriceChange: (price: number) => void;
};

export default function CarCard({ selected, leaseMonths, optionPrice, onPick, onRemove, onOptionPriceChange }: Props) {
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
                  d="M6 7h12M9 7V4h6v3m-9 4h12l-1 9H8l-1-9z"/>
          </svg>
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="shrink-0">
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
              ¥{selected?.monthly ? selected.monthly.toLocaleString() : "―"}
            </div>
          </div>
          
          {/* オプション料金入力 */}
          {selected && (
            <div className="mt-3">
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">オプション料金</label>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm text-gray-500">¥</span>
                <input
                  type="number"
                  value={optionPrice}
                  onChange={(e) => onOptionPriceChange(Number(e.target.value) || 0)}
                  className="w-20 sm:w-24 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:border-[#fc844f]"
                  placeholder="0"
                  min="0"
                />

              </div>
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

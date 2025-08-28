"use client";

import { RecommendedCar } from "@/types/cars";

type Props = {
  open: boolean;
  onClose: () => void;
  list: RecommendedCar[];
  onSelect: (id: string) => void;
};

export default function PickerModal({ open, onClose, list, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white shadow-xl w-full max-w-[900px] max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold">おすすめ車から選択</h3>
          <button onClick={onClose} className="ml-auto text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
            閉じる
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="rounded-lg cursor-pointer transition group bg-white shadow"
            >
              <div className="p-2">
                <div className="text-xs text-gray-700">{c.maker}</div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-gray-500">
                  {c.grade ?? ""} {c.people ?? ""}人
                </div>
              </div>
              <div className="flex justify-center items-center py-4">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} className="h-24 object-contain transition group-hover:opacity-60" />
                ) : (
                  <div className="h-24 w-full flex items-center justify-center text-gray-400 text-sm">画像なし</div>
                )}
              </div>
              <div className="bg-gray-100 p-2 text-center text-sm">
                月額:{" "}
                <span className="text-red-600 font-bold text-lg">¥{c.monthly.toLocaleString()}~</span>
                <span className="text-xs text-gray-600">（税込）</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

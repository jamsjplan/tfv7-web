"use client";

import { CalcResult } from "@/types/cars";

type Props = { result: CalcResult };

export default function Results({ result }: Props) {
  const isLeaseCheaper = result.tfvTotal < result.totalPurchase;
  const diff = Math.abs(result.totalPurchase - result.tfvTotal);

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-6">
      {/* 普通に購入 */}
      <div className={`rounded-xl shadow-md p-8 flex flex-col relative ${!isLeaseCheaper ? "bg-[#fffaf5] border-2 border-[#fc844f]" : "bg-white"}`}>
        {!isLeaseCheaper && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#fc844f] text-white text-xl px-4 py-2 rounded-full font-bold shadow-lg whitespace-nowrap">
            {diff.toLocaleString()} 円お得！
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">普通に購入した場合</h2>
        <p className={`font-extrabold text-center mb-8 ${!isLeaseCheaper ? "text-5xl text-[#fc844f]" : "text-4xl text-gray-800"}`}>
          ¥{result.totalPurchase.toLocaleString()}
        </p>
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>車両代合計（税抜）</span>
          <span>¥{result.carPriceTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>消費税（10%）</span>
          <span>¥{result.taxTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>オプション合計</span>
          <span>¥{result.optionTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>諸費用合計</span>
          <span>¥{result.miscTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>売却額（{result.resaleCount}台）</span>
          <span>- ¥{result.resaleTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Jセブンプラン */}
      <div className={`rounded-xl shadow-lg p-8 flex flex-col relative ${isLeaseCheaper ? "bg-[#fffaf5] border-2 border-[#fc844f]" : "bg-white"}`}>
        {isLeaseCheaper && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#fc844f] text-white text-xl px-4 py-2 rounded-full font-bold shadow-lg whitespace-nowrap">
            {diff.toLocaleString()} 円お得！
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Jセブンプラン利用の場合</h2>
        <p className={`font-extrabold text-center mb-8 ${isLeaseCheaper ? "text-5xl text-[#fc844f]" : "text-4xl text-gray-800"}`}>
          ¥{result.tfvTotal.toLocaleString()}
        </p>

        {/* 台数別内訳 */}
        {result.leaseBreakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm text-gray-700 mb-1">
            <span>{item.label}</span>
            <span>¥{item.total.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm text-gray-700 mt-2 font-bold">
          <span>リース料合計（TFV）</span>
          <span>¥{result.tfvTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

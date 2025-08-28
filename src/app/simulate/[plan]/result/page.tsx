"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSimStore } from "@/store/simStore";
import Results from "@/components/Results";
import { PLAN_LABEL, PlanKey } from "@/types/plan";

export default function ResultPage() {
  const params = useParams<{ plan: string }>();
  const plan = params.plan as PlanKey;
  if (!["j7", "j9", "jpremium"].includes(plan)) notFound();

  const router = useRouter();
  const { result, cars } = useSimStore();

  // 直接アクセスされた場合など、データがない時は入力に戻す
  useEffect(() => {
    if (!result || cars.length === 0) {
      router.replace(`/simulate/${plan}/input`);
    }
  }, [result, cars, router, plan]);

  if (!result) return null;

  return (
    <div className="bg-[#f4f3f0] min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-3">
          <div className="text-sm text-gray-500">ステップ 2 / 2</div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
            {PLAN_LABEL[plan]}｜計算結果
          </h1>
          <div className="border-b-2 border-[#fc844f] mt-1 mb-2"></div>
        </div>

        <Results result={result} />

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.push(`/simulate/${plan}/input`)}
            className="px-5 py-3 rounded-full bg-white border hover:border-[#fc844f] hover:text-[#fc844f] shadow"
          >
            入力に戻る
          </button>
          <button
            onClick={() => router.push(`/`)}
            className="px-5 py-3 rounded-full bg-[#fc844f] text-white hover:opacity-80"
          >
            他プランを試す
          </button>
        </div>
      </div>
    </div>
  );
}

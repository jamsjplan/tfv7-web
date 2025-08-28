"use client";

import Link from "next/link";
import { useSimStore } from "@/store/simStore";
import { PLAN_LABEL, PlanKey } from "@/types/plan";

const Card = ({ plan }: { plan: PlanKey }) => {
  const setPlan = useSimStore((s) => s.setPlan);
  return (
    <Link
      href={`/simulate/${plan}/input`}
      onClick={() => setPlan(plan)}
      className="block rounded-2xl bg-white p-6 shadow hover:shadow-md transition border border-transparent hover:border-[#fc844f]"
    >
      <div className="text-xl font-bold mb-2">{PLAN_LABEL[plan]}でシミュレーション</div>
      <p className="text-gray-600 text-sm">車種選択 → 設定 → 計算へ進みます。</p>
    </Link>
  );
};

export default function Home() {
  return (
    <main className="bg-[#f4f3f0] min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">トランスファーVシミュレーション</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card plan="j7" />
          <Card plan="j9" />
        </div>
      </div>
    </main>
  );
}

import { PlanKey } from "@/types/plan";

export const getLeaseMonths = (total: number, index: number, plan: PlanKey = "j7") => {
  // トランスファーV7のルール
  if (plan === "j7") {
    if (total === 1) return 84;
    if (total === 2) {
      if (index === 0) return 38; // 1台目は38ヶ月以上
      return 46; // 2台目は84-38=46ヶ月
    }
    if (total === 3) {
      if (index < 2) return 38; // 1台目、2台目は38ヶ月以上
      return 8; // 3台目は84-(38+38)=8ヶ月
    }
  }
  
  // Jナインのルール（将来的に拡張可能）
  if (plan === "j9") {
    // 現在はJセブンと同じルール
    if (total === 1) return 84;
    if (total === 2) {
      if (index === 0) return 38;
      return 46;
    }
    if (total === 3) {
      if (index < 2) return 38;
      return 8;
    }
  }
  
  return 0;
};

// プランごとの最大車両数を取得
export const getMaxCars = (plan: PlanKey): number => {
  switch (plan) {
    case "j7":
    case "j9":
      return 3;
    default:
      return 1;
  }
};

// プランごとの合計リース期間を取得
export const getTotalLeaseMonths = (plan: PlanKey): number => {
  switch (plan) {
    case "j7":
    case "j9":
      return 84;
    default:
      return 84;
  }
};
  
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

// 車両が売却対象かどうかを判定
export const isResaleTarget = (total: number, index: number): boolean => {
  // 1台のみの場合は売却対象なし
  if (total === 1) return false;
  
  // 2台の場合：1台目のみ売却対象
  if (total === 2) {
    return index === 0;
  }
  
  // 3台の場合：1台目、2台目が売却対象
  if (total === 3) {
    return index < 2;
  }
  
  return false;
};
  
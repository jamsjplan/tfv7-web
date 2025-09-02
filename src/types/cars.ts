export interface RecommendedCar {
  id: string;
  maker: string;
  name: string;
  grade?: string;
  people?: number;
  monthly: number;
  fullprice: number;
  detailUrl: string;
  imageUrl: string;
}

export interface CarRow {
  id: number;
  modelId: string;
}

export interface CalcResult {
  carPriceTotal: number;
  taxTotal: number;
  optionTotal: number;
  miscTotal: number;
  totalPurchase: number;
  tfvTotal: number;
  leaseBreakdown: Array<{
    label: string;
    total: number;
  }>;
  resaleCount: number;
  resaleTotal: number;
  savings: number;
  error?: string;
}
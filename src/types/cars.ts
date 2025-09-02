export interface RecommendedCar {
  id: string;
  maker: string;
  name: string;
  grade?: string;
  people?: number;
  monthly7: number;
  monthly9: number;
  fullprice: number;
  detailUrl: string;
  imageUrl: string;
}

export interface CarRow {
  id: number;
  modelId: string;
}

export interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface CarOption {
  id: string;
  name: string;
  price: number;
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
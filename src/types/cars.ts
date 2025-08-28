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

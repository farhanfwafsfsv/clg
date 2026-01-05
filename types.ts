
export interface FoodAnalysisResult {
  status: 'Fresh' | 'Caution' | 'Expired' | 'Unknown';
  safetyScore: number;
  confidence: number;
  observations: string[];
  recommendation: string;
  spoilageSigns: string[];
}

export interface FoodMetadata {
  prepTime: string;
  currentTime: string;
  isRefrigerated: boolean;
  refrigerationDuration?: string;
}

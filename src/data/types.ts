export interface ParkingRecord {
  id: number;
  city: string;
  state: string;
  status: string;
  propertyType: string;
  totalSpaces: number;
  ownership: string;
}

export interface DatasetStats {
  totalRecords: number;
  totalSpaces: number;
  avgSpaces: number;
  medianSpaces: number;
  minSpaces: number;
  maxSpaces: number;
  stdDev: number;
  uniqueCities: number;
  uniqueStates: number;
  uniquePropertyTypes: number;
  uniqueStatuses: number;
  uniqueOwnerships: number;
  zeroSpaceCount: number;
  zeroSpacePercentage: number;
  missingValues: { [key: string]: number };
  duplicateCount: number;
}

export interface ModelMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  trainCount: number;
  testCount: number;
  nEstimators: number;
  maxDepth: number;
}

export interface ValidationItem {
  id: number;
  city: string;
  state: string;
  status: string;
  propertyType: string;
  ownership: string;
  actual: number;
  predicted: number;
  absoluteError: number;
  percentageError: number;
}

export interface FactorAggregation {
  category: string;
  recordCount: number;
  totalSpaces: number;
  avgSpaces: number;
  maxSpaces: number;
  minSpaces: number;
}

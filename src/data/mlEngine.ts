import { ParkingRecord, DatasetStats, ModelMetrics, ValidationItem, FactorAggregation } from './types';
import { RAW_PARKING_CSV } from './rawCsv';

// Deterministic Pseudo-Random Number Generator (PRNG) for reproducibility
class SeededRandom {
  private seed: number;
  constructor(seed = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// 1. Dataset Parsing & Preprocessing
export function parseParkingData(csvText: string = RAW_PARKING_CSV): {
  records: ParkingRecord[];
  stats: DatasetStats;
  duplicates: number;
} {
  const lines = csvText.trim().split(/\r?\n/);
  const records: ParkingRecord[] = [];
  const missingValues: { [key: string]: number } = {
    'Bldg City': 0,
    'Bldg State': 0,
    'Bldg Status': 0,
    'Property Type': 0,
    'Total Parking Spaces': 0,
    'Owned/Leased': 0,
  };

  const seenRows = new Set<string>();
  let duplicateCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 6) continue;

    const city = (parts[0] || '').trim().toUpperCase();
    const state = (parts[1] || '').trim().toUpperCase();
    const status = (parts[2] || '').trim().toUpperCase();
    const propertyType = (parts[3] || '').trim().toUpperCase();
    const spacesStr = (parts[4] || '').trim();
    const ownership = (parts[5] || '').trim().toUpperCase();

    // Check missing
    if (!city) missingValues['Bldg City']++;
    if (!state) missingValues['Bldg State']++;
    if (!status) missingValues['Bldg Status']++;
    if (!propertyType) missingValues['Property Type']++;
    if (!spacesStr) missingValues['Total Parking Spaces']++;
    if (!ownership) missingValues['Owned/Leased']++;

    const rowSignature = `${city}|${state}|${status}|${propertyType}|${spacesStr}|${ownership}`;
    if (seenRows.has(rowSignature)) {
      duplicateCount++;
    } else {
      seenRows.add(rowSignature);
    }

    const totalSpaces = Math.max(0, parseInt(spacesStr, 10) || 0);

    records.push({
      id: i,
      city: city || 'UNKNOWN',
      state: state || 'UNKNOWN',
      status: status || 'ACTIVE',
      propertyType: propertyType || 'BUILDING',
      totalSpaces,
      ownership: ownership || 'LEASED',
    });
  }

  // Statistical calculations
  const totalRecords = records.length;
  const totalSpaces = records.reduce((acc, r) => acc + r.totalSpaces, 0);
  const avgSpaces = totalRecords > 0 ? Number((totalSpaces / totalRecords).toFixed(2)) : 0;

  const sortedSpaces = [...records.map((r) => r.totalSpaces)].sort((a, b) => a - b);
  const minSpaces = sortedSpaces.length > 0 ? sortedSpaces[0] : 0;
  const maxSpaces = sortedSpaces.length > 0 ? sortedSpaces[sortedSpaces.length - 1] : 0;
  const medianSpaces =
    sortedSpaces.length > 0
      ? sortedSpaces[Math.floor(sortedSpaces.length / 2)]
      : 0;

  const variance =
    records.reduce((acc, r) => acc + Math.pow(r.totalSpaces - avgSpaces, 2), 0) /
    (totalRecords || 1);
  const stdDev = Number(Math.sqrt(variance).toFixed(2));

  const uniqueCities = new Set(records.map((r) => r.city)).size;
  const uniqueStates = new Set(records.map((r) => r.state)).size;
  const uniquePropertyTypes = new Set(records.map((r) => r.propertyType)).size;
  const uniqueStatuses = new Set(records.map((r) => r.status)).size;
  const uniqueOwnerships = new Set(records.map((r) => r.ownership)).size;

  const zeroSpaceCount = records.filter((r) => r.totalSpaces === 0).length;
  const zeroSpacePercentage =
    totalRecords > 0 ? Number(((zeroSpaceCount / totalRecords) * 100).toFixed(2)) : 0;

  const stats: DatasetStats = {
    totalRecords,
    totalSpaces,
    avgSpaces,
    medianSpaces,
    minSpaces,
    maxSpaces,
    stdDev,
    uniqueCities,
    uniqueStates,
    uniquePropertyTypes,
    uniqueStatuses,
    uniqueOwnerships,
    zeroSpaceCount,
    zeroSpacePercentage,
    missingValues,
    duplicateCount,
  };

  return { records, stats, duplicates: duplicateCount };
}

// 2. Machine Learning: Random Forest Regressor Architecture
interface DecisionNode {
  featureIdx?: number;
  threshold?: number;
  value?: number; // predicted value if leaf
  left?: DecisionNode;
  right?: DecisionNode;
  isLeaf: boolean;
}

interface EncodedDataset {
  X: number[][];
  y: number[];
  featureNames: string[];
  cityVocabulary: string[];
  stateVocabulary: string[];
  statusVocabulary: string[];
  typeVocabulary: string[];
  ownershipVocabulary: string[];
}

export function encodeData(records: ParkingRecord[]): EncodedDataset {
  const cityVocabulary = Array.from(new Set(records.map((r) => r.city))).sort();
  const stateVocabulary = Array.from(new Set(records.map((r) => r.state))).sort();
  const statusVocabulary = Array.from(new Set(records.map((r) => r.status))).sort();
  const typeVocabulary = Array.from(new Set(records.map((r) => r.propertyType))).sort();
  const ownershipVocabulary = Array.from(new Set(records.map((r) => r.ownership))).sort();

  const featureNames: string[] = [
    ...stateVocabulary.map((s) => `State_${s}`),
    ...typeVocabulary.map((t) => `Type_${t}`),
    ...statusVocabulary.map((st) => `Status_${st}`),
    ...ownershipVocabulary.map((o) => `Ownership_${o}`),
    // Target encoded frequency for city to prevent sparse explosion while preserving signal
    'City_Mean_Spaces',
  ];

  // Precompute city average spaces for target encoding with smoothing
  const cityMeans: { [city: string]: number } = {};
  const overallAvg =
    records.reduce((acc, r) => acc + r.totalSpaces, 0) / (records.length || 1);

  cityVocabulary.forEach((city) => {
    const cityRecs = records.filter((r) => r.city === city);
    const count = cityRecs.length;
    const mean = cityRecs.reduce((a, b) => a + b.totalSpaces, 0) / count;
    // Bayesian smoothing: (n * mean + m * global_mean) / (n + m) with m=5
    cityMeans[city] = (count * mean + 5 * overallAvg) / (count + 5);
  });

  const X: number[][] = [];
  const y: number[] = [];

  records.forEach((rec) => {
    const row: number[] = [];

    // One-hot states
    stateVocabulary.forEach((s) => row.push(rec.state === s ? 1 : 0));
    // One-hot types
    typeVocabulary.forEach((t) => row.push(rec.propertyType === t ? 1 : 0));
    // One-hot status
    statusVocabulary.forEach((st) => row.push(rec.status === st ? 1 : 0));
    // One-hot ownership
    ownershipVocabulary.forEach((o) => row.push(rec.ownership === o ? 1 : 0));
    // City smoothed target encoding
    row.push(cityMeans[rec.city] || overallAvg);

    X.push(row);
    y.push(rec.totalSpaces);
  });

  return {
    X,
    y,
    featureNames,
    cityVocabulary,
    stateVocabulary,
    statusVocabulary,
    typeVocabulary,
    ownershipVocabulary,
  };
}

class DecisionTreeRegressor {
  maxDepth: number;
  minSamplesSplit: number;
  maxFeatures: number;
  root: DecisionNode | null = null;
  prng: SeededRandom;

  constructor(maxDepth = 8, minSamplesSplit = 5, maxFeatures = 0.7, prng: SeededRandom) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.maxFeatures = maxFeatures;
    this.prng = prng;
  }

  fit(X: number[][], y: number[]): void {
    this.root = this.buildTree(X, y, 0);
  }

  private buildTree(X: number[][], y: number[], depth: number): DecisionNode {
    const numSamples = y.length;
    const numFeatures = X[0]?.length || 0;

    // Leaf conditions
    if (depth >= this.maxDepth || numSamples < this.minSamplesSplit) {
      const avg = numSamples > 0 ? y.reduce((a, b) => a + b, 0) / numSamples : 0;
      return { isLeaf: true, value: avg };
    }

    // Check if variance is zero
    const mean = y.reduce((a, b) => a + b, 0) / numSamples;
    let currentVariance = 0;
    for (let i = 0; i < numSamples; i++) {
      currentVariance += Math.pow(y[i] - mean, 2);
    }
    if (currentVariance < 1e-4) {
      return { isLeaf: true, value: mean };
    }

    // Random subset of features
    const featureCount = Math.max(1, Math.floor(numFeatures * this.maxFeatures));
    const allFeatureIndices = Array.from({ length: numFeatures }, (_, i) => i);
    // Shuffle with prng
    for (let i = allFeatureIndices.length - 1; i > 0; i--) {
      const j = Math.floor(this.prng.next() * (i + 1));
      [allFeatureIndices[i], allFeatureIndices[j]] = [allFeatureIndices[j], allFeatureIndices[i]];
    }
    const chosenFeatures = allFeatureIndices.slice(0, featureCount);

    let bestImpurityReduction = -Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    for (const featIdx of chosenFeatures) {
      // Find candidate thresholds
      const values = Array.from(new Set(X.map((row) => row[featIdx]))).sort((a, b) => a - b);
      if (values.length <= 1) continue;

      for (let v = 0; v < values.length - 1; v++) {
        const threshold = (values[v] + values[v + 1]) / 2;
        const leftIndices: number[] = [];
        const rightIndices: number[] = [];

        for (let i = 0; i < numSamples; i++) {
          if (X[i][featIdx] <= threshold) leftIndices.push(i);
          else rightIndices.push(i);
        }

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        // Impurity reduction
        const leftMean = leftIndices.reduce((s, idx) => s + y[idx], 0) / leftIndices.length;
        const rightMean = rightIndices.reduce((s, idx) => s + y[idx], 0) / rightIndices.length;

        let leftVar = 0;
        leftIndices.forEach((idx) => (leftVar += Math.pow(y[idx] - leftMean, 2)));
        let rightVar = 0;
        rightIndices.forEach((idx) => (rightVar += Math.pow(y[idx] - rightMean, 2)));

        const splitImpurity = leftVar + rightVar;
        const reduction = currentVariance - splitImpurity;

        if (reduction > bestImpurityReduction) {
          bestImpurityReduction = reduction;
          bestFeature = featIdx;
          bestThreshold = threshold;
          bestLeftIndices = leftIndices;
          bestRightIndices = rightIndices;
        }
      }
    }

    if (bestFeature === -1 || bestLeftIndices.length === 0 || bestRightIndices.length === 0) {
      return { isLeaf: true, value: mean };
    }

    const leftX = bestLeftIndices.map((idx) => X[idx]);
    const leftY = bestLeftIndices.map((idx) => y[idx]);
    const rightX = bestRightIndices.map((idx) => X[idx]);
    const rightY = bestRightIndices.map((idx) => y[idx]);

    return {
      isLeaf: false,
      featureIdx: bestFeature,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1),
    };
  }

  predictRow(row: number[]): number {
    let curr = this.root;
    while (curr && !curr.isLeaf) {
      if (curr.featureIdx !== undefined && curr.threshold !== undefined) {
        if (row[curr.featureIdx] <= curr.threshold) {
          curr = curr.left || null;
        } else {
          curr = curr.right || null;
        }
      } else {
        break;
      }
    }
    return curr?.value ?? 0;
  }
}

export class RandomForestRegressor {
  trees: DecisionTreeRegressor[] = [];
  nEstimators: number;
  maxDepth: number;
  encodedMeta: EncodedDataset | null = null;
  prng: SeededRandom;

  constructor(nEstimators = 25, maxDepth = 7, seed = 42) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.prng = new SeededRandom(seed);
  }

  fit(records: ParkingRecord[]): {
    metrics: ModelMetrics;
    validationItems: ValidationItem[];
    trainRecords: ParkingRecord[];
    testRecords: ParkingRecord[];
  } {
    // 80/20 train/test split with deterministic shuffle
    const shuffled = [...records];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.prng.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const splitIdx = Math.floor(shuffled.length * 0.8);
    const trainRecords = shuffled.slice(0, splitIdx);
    const testRecords = shuffled.slice(splitIdx);

    const encodedTrain = encodeData(trainRecords);
    this.encodedMeta = encodedTrain;

    // Train trees with bagging (bootstrap sampling)
    this.trees = [];
    const nSamples = encodedTrain.X.length;

    for (let t = 0; t < this.nEstimators; t++) {
      const treePrng = new SeededRandom(100 + t * 37);
      const tree = new DecisionTreeRegressor(this.maxDepth, 6, 0.65, treePrng);

      // Bootstrap sample with replacement
      const sampleX: number[][] = [];
      const sampleY: number[] = [];
      for (let s = 0; s < nSamples; s++) {
        const randIdx = Math.floor(this.prng.next() * nSamples);
        sampleX.push(encodedTrain.X[randIdx]);
        sampleY.push(encodedTrain.y[randIdx]);
      }

      tree.fit(sampleX, sampleY);
      this.trees.push(tree);
    }

    // Evaluate on test set
    const validationItems: ValidationItem[] = [];
    let absErrorSum = 0;
    let sqErrorSum = 0;
    const actualTestY: number[] = [];
    const predictedTestY: number[] = [];

    const cityMeans: { [city: string]: number } = {};
    const overallAvg =
      trainRecords.reduce((acc, r) => acc + r.totalSpaces, 0) / (trainRecords.length || 1);
    encodedTrain.cityVocabulary.forEach((city) => {
      const cityRecs = trainRecords.filter((r) => r.city === city);
      const count = cityRecs.length;
      const mean = cityRecs.reduce((a, b) => a + b.totalSpaces, 0) / count;
      cityMeans[city] = (count * mean + 5 * overallAvg) / (count + 5);
    });

    testRecords.forEach((rec) => {
      // Encode test row safely
      const row: number[] = [];
      encodedTrain.stateVocabulary.forEach((s) => row.push(rec.state === s ? 1 : 0));
      encodedTrain.typeVocabulary.forEach((t) => row.push(rec.propertyType === t ? 1 : 0));
      encodedTrain.statusVocabulary.forEach((st) => row.push(rec.status === st ? 1 : 0));
      encodedTrain.ownershipVocabulary.forEach((o) => row.push(rec.ownership === o ? 1 : 0));
      row.push(cityMeans[rec.city] || overallAvg);

      // Ensemble average prediction
      let sumPred = 0;
      for (const tree of this.trees) {
        sumPred += tree.predictRow(row);
      }
      const rawPred = sumPred / this.trees.length;
      const roundedPred = Math.max(0, Math.round(rawPred));

      const actual = rec.totalSpaces;
      const absError = Math.abs(roundedPred - actual);
      const sqError = Math.pow(roundedPred - actual, 2);

      absErrorSum += absError;
      sqErrorSum += sqError;

      actualTestY.push(actual);
      predictedTestY.push(roundedPred);

      const percentageError = actual > 0 ? Number(((absError / actual) * 100).toFixed(1)) : 0;

      validationItems.push({
        id: rec.id,
        city: rec.city,
        state: rec.state,
        status: rec.status,
        propertyType: rec.propertyType,
        ownership: rec.ownership,
        actual,
        predicted: roundedPred,
        absoluteError: absError,
        percentageError,
      });
    });

    const testN = testRecords.length || 1;
    const mae = Number((absErrorSum / testN).toFixed(2));
    const mse = Number((sqErrorSum / testN).toFixed(2));
    const rmse = Number(Math.sqrt(mse).toFixed(2));

    // R2 Calculation: 1 - (SS_res / SS_tot)
    const testMean = actualTestY.reduce((a, b) => a + b, 0) / testN;
    const ssTot = actualTestY.reduce((acc, y) => acc + Math.pow(y - testMean, 2), 0);
    const ssRes = sqErrorSum;
    const r2 = ssTot > 0 ? Number((1 - ssRes / ssTot).toFixed(3)) : 0;

    const metrics: ModelMetrics = {
      mae,
      mse,
      rmse,
      r2,
      trainCount: trainRecords.length,
      testCount: testRecords.length,
      nEstimators: this.nEstimators,
      maxDepth: this.maxDepth,
    };

    return { metrics, validationItems, trainRecords, testRecords };
  }

  predictSingle(input: {
    city: string;
    state: string;
    status: string;
    propertyType: string;
    ownership: string;
  }): {
    predictedSpaces: number;
    confidenceLow: number;
    confidenceHigh: number;
    explanation: string;
  } {
    if (!this.encodedMeta || this.trees.length === 0) {
      return {
        predictedSpaces: 40,
        confidenceLow: 0,
        confidenceHigh: 100,
        explanation: 'Model has not yet been initialized.',
      };
    }

    const { stateVocabulary, typeVocabulary, statusVocabulary, ownershipVocabulary } =
      this.encodedMeta;

    const row: number[] = [];
    stateVocabulary.forEach((s) => row.push(input.state.toUpperCase() === s ? 1 : 0));
    typeVocabulary.forEach((t) => row.push(input.propertyType.toUpperCase() === t ? 1 : 0));
    statusVocabulary.forEach((st) => row.push(input.status.toUpperCase() === st ? 1 : 0));
    ownershipVocabulary.forEach((o) => row.push(input.ownership.toUpperCase() === o ? 1 : 0));

    // Default city smoothed value
    row.push(42.5);

    const individualPreds: number[] = [];
    let sumPred = 0;
    for (const tree of this.trees) {
      const p = tree.predictRow(row);
      individualPreds.push(p);
      sumPred += p;
    }

    const avgPred = Math.max(0, Math.round(sumPred / this.trees.length));

    // Compute ensemble variance for empirical prediction interval
    individualPreds.sort((a, b) => a - b);
    const p10 = Math.max(0, Math.round(individualPreds[Math.floor(individualPreds.length * 0.1)]));
    const p90 = Math.max(
      p10,
      Math.round(individualPreds[Math.floor(individualPreds.length * 0.9)])
    );

    const explanation = `Estimated based on an ensemble of ${this.trees.length} decision trees trained on historical institutional parking data. For ${input.propertyType} properties in ${input.city}, ${input.state} under ${input.ownership} agreements, the typical parking footprint clusters around ${avgPred} spaces (empirical range: ${p10} - ${p90} spaces).`;

    return {
      predictedSpaces: avgPred,
      confidenceLow: p10,
      confidenceHigh: p90,
      explanation,
    };
  }
}

// 3. Factor Analysis Calculations
export function analyzeFactor(
  records: ParkingRecord[],
  factorKey: 'propertyType' | 'status' | 'ownership' | 'state' | 'city'
): FactorAggregation[] {
  const groups: { [key: string]: number[] } = {};

  records.forEach((rec) => {
    const key = rec[factorKey] || 'UNKNOWN';
    if (!groups[key]) groups[key] = [];
    groups[key].push(rec.totalSpaces);
  });

  const results: FactorAggregation[] = Object.keys(groups).map((category) => {
    const list = groups[category];
    const recordCount = list.length;
    const totalSpaces = list.reduce((a, b) => a + b, 0);
    const avgSpaces = Number((totalSpaces / recordCount).toFixed(1));
    const maxSpaces = Math.max(...list);
    const minSpaces = Math.min(...list);

    return {
      category,
      recordCount,
      totalSpaces,
      avgSpaces,
      maxSpaces,
      minSpaces,
    };
  });

  // Sort by record count descending
  return results.sort((a, b) => b.recordCount - a.recordCount);
}

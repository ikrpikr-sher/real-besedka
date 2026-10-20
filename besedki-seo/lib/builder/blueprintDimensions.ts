export type BlueprintDimensions = {
  facadeM: number;
  depthM: number;
  ridgeM: number;
  overhangM: number;
  /** Закрытая беседка с остеклением — другой силуэт на чертеже. */
  glazed?: boolean;
};

const OPEN: Record<string, BlueprintDimensions> = {
  'b-10': { facadeM: 2.0, depthM: 2.0, ridgeM: 2.4, overhangM: 0.16 },
  'b-11': { facadeM: 4.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-12': { facadeM: 3.0, depthM: 3.0, ridgeM: 2.7, overhangM: 0.18 },
  'b-13': { facadeM: 4.0, depthM: 3.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-14': { facadeM: 6.0, depthM: 3.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-15': { facadeM: 4.0, depthM: 3.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-16': { facadeM: 5.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-41': { facadeM: 3.0, depthM: 3.0, ridgeM: 2.5, overhangM: 0.18 },
  'b-42': { facadeM: 3.0, depthM: 4.0, ridgeM: 2.5, overhangM: 0.18 },
  'b-43': { facadeM: 4.0, depthM: 4.0, ridgeM: 2.7, overhangM: 0.18 },
  'b-44': { facadeM: 5.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-45': { facadeM: 5.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-46': { facadeM: 6.0, depthM: 3.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-47': { facadeM: 6.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-48': { facadeM: 6.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-49': { facadeM: 8.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-50': { facadeM: 8.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18 },
  'b-51': { facadeM: 2.5, depthM: 2.5, ridgeM: 2.5, overhangM: 0.16 },
  'b-52': { facadeM: 2.6, depthM: 2.6, ridgeM: 2.5, overhangM: 0.16 },
};



const GLAZED: Record<string, BlueprintDimensions> = {
  'b-21': { facadeM: 3.0, depthM: 3.0, ridgeM: 2.5, overhangM: 0.18, glazed: true },
  'b-22': { facadeM: 3.0, depthM: 4.0, ridgeM: 2.5, overhangM: 0.18, glazed: true },
  'b-23': { facadeM: 4.0, depthM: 4.0, ridgeM: 2.7, overhangM: 0.18, glazed: true },
  'b-24': { facadeM: 5.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-25': { facadeM: 5.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-26': { facadeM: 6.0, depthM: 3.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-27': { facadeM: 6.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-28': { facadeM: 6.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-29': { facadeM: 8.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-30': { facadeM: 8.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-31': { facadeM: 3.0, depthM: 3.0, ridgeM: 2.5, overhangM: 0.18, glazed: true },
  'b-32': { facadeM: 3.0, depthM: 4.0, ridgeM: 2.5, overhangM: 0.18, glazed: true },
  'b-33': { facadeM: 4.0, depthM: 4.0, ridgeM: 2.7, overhangM: 0.18, glazed: true },
  'b-34': { facadeM: 5.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-35': { facadeM: 5.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-36': { facadeM: 6.0, depthM: 3.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-37': { facadeM: 6.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-38': { facadeM: 6.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-39': { facadeM: 8.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-40': { facadeM: 8.0, depthM: 5.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
  'b-53': { facadeM: 3.0, depthM: 4.0, ridgeM: 3.0, overhangM: 0.18, glazed: true },
};

export function getBlueprintDimensions(slug: string | null | undefined): BlueprintDimensions {
  if (!slug) return OPEN['b-12'];
  return OPEN[slug] ?? GLAZED[slug] ?? OPEN['b-12'];
}

export function formatDimCm(meters: number): string {
  return `${Math.round(meters * 100)} cm`;
}

export function formatDimM(meters: number): string {
  return `${meters.toFixed(1).replace('.', ',')} м`;
}

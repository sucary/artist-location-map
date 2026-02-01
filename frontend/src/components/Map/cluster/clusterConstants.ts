export const CLUSTER_CONFIG = {
  disableClusteringAtZoomLevel: 8,
  maxClusterRadius: 100,
  gridSpacing: 22,

  minClusterSize: 28,
  maxClusterSize: 400,

  maxOffsetRatio: 0.25,

  // Delay before refreshing clusters on initial load (ms)
  refreshDelay: 100,
} as const;

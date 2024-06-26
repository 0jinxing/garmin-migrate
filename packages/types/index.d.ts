export type Act = {
  activityId: number;
  activityName: string;
  distance: number;
  duration: number;
  movingDuration: number;
  elevationGain: number;
  elevationLoss: number;
  averageSpeed: number;
  maxSpeed: number;
  startLatitude: number;
  startLongitude: number;
  calories: number;
  averageHR: number;
  maxHR: number;
  averageRunningCadenceInStepsPerMinute: number;
  maxRunningCadenceInStepsPerMinute: number;
  steps: number;
  timeZoneId: number;
  beginTimestamp: number;
  avgStrideLength: number;
  minTemperature: number;
  maxTemperature: number;
  minElevation: number;
  maxElevation: number;
  maxDoubleCadence: number;
  maxVerticalSpeed: number;
  locationName: string;
  lapCount: number;
  endLatitude: number;
  endLongitude: number;
  minActivityLapDuration: number;
  hasPolyline: boolean;
};

export type Mesg = {
  positionLat?: number;
  positionLong?: number;
  timestamp: string;
  distance: number;
  enhancedSpeed: number;
  enhancedAltitude: number;
  heartRate: number;
  cadence: number;
  temperature: number;
  fractionalCadence: number;
};

export type ActWithMesgs = Act & { mesgs: Mesg[] };

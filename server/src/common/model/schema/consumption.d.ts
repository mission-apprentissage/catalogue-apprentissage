export type Consumption = {
  // Chemin d'appel
  path: string;
  // Method d'appel
  method: string;
  // Nombre d'appels de la route
  globalCallCount: number;
  // Consommateur de l'api
  consumers: {
    caller: string;
    callCount: number;
    date: Date;
  }[];
};

export interface ApiSettings {
  jwtSecretKey: string;
  apiProtocol: string;
  apiHost: string;
  apiPort: number;
  apiBaseUrl: string;
  hostMaintainerId: string;
}

export interface DatabaseSettings {
  database: string;
  username: string;
  password: string;
  dbHost: string;
  dbPort: number;
}

export interface ApiData<T> {
  id: string;
  attributes: Omit<T, "id">;
  relationships: Record<string, ApiData<any> | Array<ApiData<any>>>;
}

export interface ApiSettings {
  jwtSecretKey: string;
  apiProtocol: string;
  apiHost: string;
  apiPort: number;
  apiBaseUrl: string;
  hostMaintainerId: string;
}

export interface ApiData<T> {
  id: string;
  attributes: Omit<T, "id">;
  relationships: Record<string, ApiData<unknown> | Array<ApiData<unknown>>>;
}

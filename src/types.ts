export interface ApiSettings {
  jwtSecretKey: string;
  apiProtocol: string;
  apiHost: string;
  apiPort: number;
  apiBaseUrl: string;
  hostMaintainerId?: string;
}

export interface ApiData<T> {
  type: string;
  id: string;
  attributes: Omit<T, "id">;
  relationships: Record<
    string,
    { data: ApiData<unknown> | Array<ApiData<unknown>> }
  >;
}

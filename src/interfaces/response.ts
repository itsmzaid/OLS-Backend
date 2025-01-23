export interface IResponse<T = void> {
  statusCode: number;
  message?: string;
  count?: number;
  data?: Partial<T | T[]>;
}

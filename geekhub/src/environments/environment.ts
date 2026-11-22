import type { FonteDados } from '../app/api/configuracao-api';

export const environment: {
  readonly producao: boolean;
  readonly apiUrl: string;
  readonly fonteDados: FonteDados;
} = {
  producao: false,
  apiUrl: 'http://localhost:8080',
  fonteDados: 'auto',
};

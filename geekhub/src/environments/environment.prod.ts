import type { FonteDados } from '../app/api/configuracao-api';

export const environment: {
  readonly producao: boolean;
  readonly apiUrl: string;
  readonly fonteDados: FonteDados;
} = {
  producao: true,
  apiUrl: 'https://geekhub-api.onrender.com',
  fonteDados: 'auto',
};

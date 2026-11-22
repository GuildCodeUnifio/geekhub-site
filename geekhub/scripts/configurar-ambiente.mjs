import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const urlBruta = process.env.GEEKHUB_API_URL?.trim();

if (urlBruta) {
  const urlNormalizada = urlBruta.replace(/\/+$/, '');
  const diretorioAtual = dirname(fileURLToPath(import.meta.url));
  const destino = resolve(diretorioAtual, '../src/environments/environment.prod.ts');

  writeFileSync(
    destino,
    `import type { FonteDados } from '../app/api/configuracao-api';

export const environment: {
  readonly producao: boolean;
  readonly apiUrl: string;
  readonly fonteDados: FonteDados;
} = {
  producao: true,
  apiUrl: '${urlNormalizada.replace(/'/g, "\\'")}',
  fonteDados: 'auto',
};
`,
    'utf8',
  );
  console.log(`Ambiente de produção atualizado para API: ${urlNormalizada}`);
}

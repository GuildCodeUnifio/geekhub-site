import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogoModule } from '../catalogo-module';
import { CartaoProdutoComponente } from './cartao-produto.componente';

registerLocaleData(localePt, 'pt-BR');

describe('CartaoProdutoComponente', () => {
  let component: CartaoProdutoComponente;
  let fixture: ComponentFixture<CartaoProdutoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CartaoProdutoComponente);
    component = fixture.componentInstance;
    component.anuncio = {
      identificador: 1,
      nome: 'Action figure Naruto',
      titulo: 'Action figura Naruto 1 edição',
      descricao: 'Produto original com nota fiscal',
      imagens: ['https://cdn.myanimelist.net/images/anime/13/17405.jpg'],
      categoriaIdentificador: 1,
      categoria: 'Figuras colecionáveis',
      preco: 1850,
      estado: 'Novo',
      conservacao: 'Lacrado',
      estoque: 3,
      disponivel: true,
      vendedor: {
        identificador: 2,
        nome: 'Luiz Carlos Oliveira',
        media: 5,
        contagem: 1,
      },
    };
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('exibe imagem, nome, preco formatado e link para detalhes do produto', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const link = elemento.querySelector('a') as HTMLAnchorElement;
    const imagem = elemento.querySelector('img') as HTMLImageElement;

    expect(link.getAttribute('href')).toBe('/produtos/1');
    expect(imagem.getAttribute('src')).toBe(
      'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
    );
    expect(elemento.textContent).toContain('Action figure Naruto');
    expect(elemento.textContent).toContain('1.850,00');
  });

  it('exibe indicador alternativo quando o anuncio nao possui imagens', async () => {
    fixture.componentRef.setInput('anuncio', {
      ...component.anuncio,
      imagens: [],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('img')).toBeNull();
    expect(elemento.querySelector('.sem-imagem')).toBeTruthy();
  });
});

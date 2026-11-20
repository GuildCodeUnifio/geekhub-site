import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../app';
import { CatalogoModule } from '../catalogo-module';
import { CatalogoComponente } from './catalogo.componente';

describe('CatalogoComponente', () => {
  let component: CatalogoComponente;
  let fixture: ComponentFixture<CatalogoComponente>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoModule],
      providers: [provideRouter([{ path: '', component: CatalogoComponente }]), App],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CatalogoComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exibe botão Todos, categorias disponíveis e 8 cartões na primeira página ocultando anúncios indisponíveis', async () => {
    const botoesCategoria = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('.barra-categorias .botao-categoria'),
    );
    const cartoes = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('app-cartao-produto'),
    );
    const links = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('app-cartao-produto a.link-produto'),
    );

    expect(botoesCategoria.map((botao) => botao.textContent?.trim())).toEqual([
      'Todos',
      'Figuras colecionáveis',
      'Quadrinhos e mangás',
      'Jogos',
      'Acessórios',
    ]);
    expect(cartoes).toHaveLength(8);
    expect(component.totalResultados).toBe(10);
    expect(links[0].getAttribute('href')).toBe('/produtos/1');

    const pagina2 = await firstValueFrom(component.consultarAnuncios({ pagina: 2, itensPorPagina: 8 }));
    const todosDisponiveis = [...component.anuncios, ...pagina2.anuncios];
    expect(todosDisponiveis.some((anuncio) => anuncio.identificador === 11)).toBe(false);
    expect(
      todosDisponiveis.every((anuncio) => anuncio.disponivel !== false && anuncio.estoque > 0),
    ).toBe(true);
  });

  it('filtra por categoria pelos botões, reseta para a página 1 e restaura em Todos', async () => {
    component.aoMudarPagina({ pageIndex: 1, pageSize: 8, length: 10 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(2);

    const botoes = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('.barra-categorias .botao-categoria'),
    );
    const botaoMangas = botoes.find((b) => b.textContent?.trim() === 'Quadrinhos e mangás');
    expect(botaoMangas).toBeTruthy();

    botaoMangas!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.paginaAtual()).toBe(1);
    expect(component.totalResultados).toBe(3);
    expect(component.anuncios).toHaveLength(3);
    expect(component.anuncios.every((anuncio) => anuncio.categoriaIdentificador === 2)).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(3);

    botoes[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.categoriaSelecionada()).toBeUndefined();
    expect(component.totalResultados).toBe(10);
    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(8);
  });

  it('pagina resultados pelo MatPaginator em português, altera tamanho da página e limita página fora do intervalo', async () => {
    const elementoPaginador: HTMLElement | null =
      fixture.nativeElement.querySelector('mat-paginator');
    expect(elementoPaginador).toBeTruthy();
    expect(elementoPaginador!.textContent).toContain('Itens por página:');
    expect(elementoPaginador!.textContent).toContain('1 – 8 de 10');

    const botaoProxima: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button.mat-mdc-paginator-navigation-next',
    );
    expect(botaoProxima).toBeTruthy();
    botaoProxima!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.paginaAtual()).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(2);
    expect(elementoPaginador!.textContent).toContain('9 – 10 de 10');

    component.aoMudarPagina({ pageIndex: 0, pageSize: 4, length: 10 });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(4);
    expect(elementoPaginador!.textContent).toContain('1 – 4 de 10');

    const paginaForaLimite = await firstValueFrom(component.consultarAnuncios({ pagina: 99, itensPorPagina: 8 }));
    expect(paginaForaLimite.pagina).toBe(2);
    expect(paginaForaLimite.anuncios).toHaveLength(2);
  });

  it('filtra por parâmetro busca na rota, exibe estado vazio sem paginador e limpa seleção', async () => {
    await router.navigate(['/'], { queryParams: { busca: 'mangá' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.buscaAplicada).toBe('mangá');
    expect(component.totalResultados).toBeGreaterThan(0);
    expect(
      component.anuncios.every(
        (a) =>
          a.nome.toLowerCase().includes('mangá') ||
          a.titulo.toLowerCase().includes('mangá') ||
          a.categoria.toLowerCase().includes('mangá'),
      ),
    ).toBe(true);

    const estadoStatus: HTMLElement | null = fixture.nativeElement.querySelector('.status-busca');
    expect(estadoStatus?.textContent).toContain('Busca por “mangá”');

    await router.navigate(['/'], { queryParams: { busca: 'item-inexistente-xyz' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.anuncios).toHaveLength(0);
    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeNull();

    const estadoVazio: HTMLElement | null = fixture.nativeElement.querySelector('.estado-vazio');
    expect(estadoVazio?.textContent).toContain('Nenhum produto encontrado.');

    const botaoLimpar: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.botao-limpar');
    expect(botaoLimpar?.textContent?.trim()).toBe('Limpar seleção');

    botaoLimpar!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.buscaAplicada).toBe('');
    expect(component.categoriaSelecionada()).toBeUndefined();
    expect(component.paginaAtual()).toBe(1);
    expect(component.totalResultados).toBe(10);
    expect(fixture.nativeElement.querySelectorAll('app-cartao-produto')).toHaveLength(8);
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeTruthy();
  });

  it('aplica filtro inicial pelo query param categoria vindo do breadcrumb', async () => {
    await router.navigate(['/'], { queryParams: { categoria: 3 } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.categoriaSelecionada()).toBe(3);
    expect(component.totalResultados).toBe(3);
    expect(component.anuncios.every((anuncio) => anuncio.categoriaIdentificador === 3)).toBe(true);
  });
});

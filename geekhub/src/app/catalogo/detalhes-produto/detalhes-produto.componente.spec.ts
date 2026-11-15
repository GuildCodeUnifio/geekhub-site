import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { App } from '../../app';
import { CatalogoModule } from '../catalogo-module';
import { DetalhesProdutoComponente } from './detalhes-produto.componente';

describe('DetalhesProdutoComponente', () => {
  let component: DetalhesProdutoComponente;
  let fixture: ComponentFixture<DetalhesProdutoComponente>;
  let app: App;
  let router: Router;
  let paramMap$: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    localStorage.clear();
    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ identificador: '1' }));

    await TestBed.configureTestingModule({
      imports: [CatalogoModule],
      providers: [
        provideRouter([]),
        App,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    app = TestBed.inject(App);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(DetalhesProdutoComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exibe breadcrumb, detalhes completos do anuncio e link para perfil do vendedor (US09 #49)', () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const trilha = elemento.querySelector('.trilha-navegacao');
    const linkVendedor = elemento.querySelector('a.cartao-vendedor') as HTMLAnchorElement | null;

    expect(component.anuncio()?.identificador).toBe(1);
    expect(trilha?.textContent).toContain('Início');
    expect(trilha?.textContent).toContain('Figuras colecionáveis');
    expect(trilha?.textContent).toContain('Action figure Naruto');

    expect(elemento.querySelector('h1')?.textContent?.trim()).toBe('Action figure Naruto');
    expect(elemento.querySelector('.preco')?.textContent).toContain('1.850,00');
    expect(elemento.querySelector('.quadro-informacoes')?.textContent).toContain('Novo');
    expect(elemento.querySelector('.quadro-informacoes')?.textContent).toContain('3 unidades');
    expect(elemento.querySelector('.descricao')?.textContent).toContain(
      'Produto original com nota fiscal',
    );
    expect(linkVendedor?.getAttribute('href')).toBe('/vendedores/2');
    expect(linkVendedor?.textContent).toContain('Luiz Carlos Oliveira');
  });

  it('alterna a imagem principal ao clicar nas miniaturas sem alterar o array original (US09 #50)', async () => {
    const anuncioInicial = component.anuncio()!;
    const imagensOriginais = [...anuncioInicial.imagens];
    const miniaturas = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('.miniaturas .miniatura'),
    );

    expect(miniaturas.length).toBe(4);
    expect(miniaturas[0].getAttribute('aria-pressed')).toBe('true');

    miniaturas[2].click();
    fixture.detectChanges();
    await fixture.whenStable();

    const imagemPrincipal = fixture.nativeElement.querySelector(
      '.imagem-produto img',
    ) as HTMLImageElement | null;

    expect(component.imagemSelecionada()).toBe(2);
    expect(imagemPrincipal?.getAttribute('src')).toBe(imagensOriginais[2]);
    expect(imagemPrincipal?.getAttribute('alt')).toBe('Action figure Naruto — foto 3');
    expect(miniaturas[2].getAttribute('aria-pressed')).toBe('true');
    expect(anuncioInicial.imagens).toEqual(imagensOriginais);
  });

  it('ajusta quantidade entre 1 e o estoque disponivel desabilitando limites (US09 #51)', async () => {
    const elemento = fixture.nativeElement as HTMLElement;
    const botoes = Array.from<HTMLButtonElement>(elemento.querySelectorAll('.botao-qtde'));
    const botaoDiminuir = botoes[0];
    const botaoAumentar = botoes[1];
    const saida = elemento.querySelector('.valor-qtde');

    expect(component.quantidade()).toBe(1);
    expect(saida?.textContent?.trim()).toBe('1');
    expect(botaoDiminuir.disabled).toBe(true);
    expect(botaoAumentar.disabled).toBe(false);

    botaoAumentar.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.quantidade()).toBe(2);
    expect(botaoDiminuir.disabled).toBe(false);
    expect(botaoAumentar.disabled).toBe(false);

    botaoAumentar.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.quantidade()).toBe(3);
    expect(botaoAumentar.disabled).toBe(true);

    component.alterarQuantidade(3, 1);
    expect(component.quantidade()).toBe(3);

    botaoDiminuir.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.quantidade()).toBe(2);
  });

  it('trata produto inexistente e anuncio indisponivel ou sem estoque bloqueando a compra (US09 #52)', async () => {
    paramMap$.next(convertToParamMap({ identificador: '999' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(component.anuncio()).toBeNull();
    expect(elemento.querySelector('.estado-nao-encontrado')?.textContent).toContain(
      'Produto não encontrado',
    );
    expect(elemento.querySelector('.botao-voltar-catalogo')?.getAttribute('href')).toBe('/');

    paramMap$.next(convertToParamMap({ identificador: '11' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.anuncio()?.identificador).toBe(11);
    expect(elemento.querySelector('.seletor-quantidade')).toBeNull();
    expect(elemento.querySelector('.aviso-indisponivel')?.textContent).toContain(
      'indisponível para compra',
    );

    const botaoAdicionar = elemento.querySelector(
      '.botao-adicionar-carrinho',
    ) as HTMLButtonElement | null;
    expect(botaoAdicionar?.disabled).toBe(true);

    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    const respostaBloqueada = component.adicionarAoCarrinho({
      ...component.anuncio()!,
      estoque: 2,
      disponivel: false,
    });
    expect(respostaBloqueada.sucesso).toBe(false);
    expect(respostaBloqueada.mensagem).toContain('indisponível');
  });

  it('redireciona para /entrar sem sessao e adiciona quantidade selecionada ao carrinho com usuario autenticado (US09 #53)', async () => {
    const spyNavegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const botaoAdicionar = fixture.nativeElement.querySelector(
      '.botao-adicionar-carrinho',
    ) as HTMLButtonElement;

    botaoAdicionar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(spyNavegar).toHaveBeenCalledWith(['/entrar'], {
      queryParams: { redirecionar: '/produtos/1' },
    });

    const usuario = app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    expect(usuario).not.toBeNull();

    component.alterarQuantidade(3, 1);
    fixture.detectChanges();
    await fixture.whenStable();

    botaoAdicionar.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const feedback = fixture.nativeElement.querySelector('.feedback-carrinho');
    expect(feedback?.classList.contains('sucesso')).toBe(true);
    expect(feedback?.textContent).toContain('Produto adicionado ao carrinho.');
    expect(fixture.nativeElement.querySelector('.link-ver-carrinho')?.getAttribute('href')).toBe(
      '/carrinho',
    );

    const carrinhoAtualizado = app.consultarCarrinho(usuario!.identificador);
    const itemNaruto = carrinhoAtualizado.itens.find((item) => item.anuncioIdentificador === 1);
    expect(itemNaruto?.quantidade).toBe(3);
    expect(carrinhoAtualizado.itens.filter((item) => item.anuncioIdentificador === 1)).toHaveLength(
      1,
    );

    const tentativaExcedente = component.adicionarAoCarrinho(component.anuncio()!, 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(tentativaExcedente.sucesso).toBe(false);
    expect(tentativaExcedente.mensagem).toContain('excede o estoque disponível');
    expect(fixture.nativeElement.querySelector('.feedback-carrinho.erro')?.textContent).toContain(
      'excede o estoque disponível',
    );
  });

  it('exibe ausencias de avaliacoes quando vendedor nao tem notas', async () => {
    vi.spyOn(app, 'buscarAnuncio').mockReturnValue({
      ...component.anuncio()!,
      vendedor: {
        identificador: 99,
        nome: 'Novo Vendedor',
        media: null,
        contagem: 0,
      },
    });

    paramMap$.next(convertToParamMap({ identificador: '1' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.vendedor-nota')?.textContent?.trim()).toBe(
      'Sem avaliações',
    );
  });
});

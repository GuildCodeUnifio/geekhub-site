import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { CarrinhoModule } from '../carrinho-module';
import { CarrinhoComponente } from './carrinho.componente';

describe('CarrinhoComponente', () => {
  let app: App;
  let component: CarrinhoComponente;
  let fixture: ComponentFixture<CarrinhoComponente>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CarrinhoModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    app = TestBed.inject(App);
    fixture = TestBed.createComponent(CarrinhoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('soma o mesmo anuncio e separa os carrinhos por comprador', async () => {
    const adicaoMesmaConta = await firstValueFrom(component.adicionarAoCarrinho({
      compradorIdentificador: 1,
      anuncioIdentificador: 1,
      quantidade: 2,
    }));

    expect(adicaoMesmaConta.sucesso).toBe(true);
    expect(component.itensCarrinho).toHaveLength(3);
    expect(component.itensCarrinho[0].quantidade).toBe(3);

    const adicaoOutroComprador = await firstValueFrom(component.adicionarAoCarrinho({
      compradorIdentificador: 2,
      anuncioIdentificador: 1,
      quantidade: 1,
    }));

    expect(adicaoOutroComprador.sucesso).toBe(true);
    expect((await firstValueFrom(component.consultarCarrinho(2))).itens).toHaveLength(1);
    expect((await firstValueFrom(component.consultarCarrinho(2))).itens[0].quantidade).toBe(1);

    const acimaDoEstoque = await firstValueFrom(component.adicionarAoCarrinho({
      compradorIdentificador: 1,
      anuncioIdentificador: 1,
      quantidade: 1,
    }));

    expect(acimaDoEstoque.sucesso).toBe(false);
    expect(component.itensCarrinho[0].quantidade).toBe(3);
    expect(component.mensagem).not.toBe('');
  });

  it('recusa quantidades invalidas e preserva a linha anterior', async () => {
    const quantidadesInvalidas: unknown[] = ['', null, undefined, 0, -1, 1.5, Number.NaN, 6];

    for (const quantidade of quantidadesInvalidas) {
      const resultadoAlteracao = await firstValueFrom(component.alterarQuantidade({
        compradorIdentificador: 1,
        anuncioIdentificador: 2,
        quantidade: quantidade as number,
      }));

      expect(resultadoAlteracao.sucesso).toBe(false);
      expect(component.itensCarrinho[1].quantidade).toBe(2);
      expect(component.mensagem).not.toBe('');

      const resultadoAdicao = await firstValueFrom(component.adicionarAoCarrinho({
        compradorIdentificador: 1,
        anuncioIdentificador: 2,
        quantidade: quantidade as number,
      }));

      expect(resultadoAdicao.sucesso).toBe(false);
      expect(component.itensCarrinho[1].quantidade).toBe(2);
    }
  });

  it('mantem item indisponivel visivel para remocao e bloqueia avanco', async () => {
    app.atualizarDisponibilidadeCarrinho(1, 1, false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.itensCarrinho[0].disponivel).toBe(false);
    expect(component.podeAvancar).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Produto indisponível no momento');

    const botaoFinalizar = fixture.nativeElement.querySelector(
      '.botao-finalizar',
    ) as HTMLButtonElement;
    expect(botaoFinalizar.disabled).toBe(true);

    const tentativaAlteracao = await firstValueFrom(component.alterarQuantidade({
      compradorIdentificador: 1,
      anuncioIdentificador: 1,
      quantidade: 2,
    }));
    expect(tentativaAlteracao.sucesso).toBe(false);
    expect(component.mensagem).not.toBe('');

    component.aoRemover(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.mensagem).toBe('');
    expect(component.podeAvancar).toBe(true);
    expect(component.itensCarrinho).toHaveLength(2);
  });

  it('oferece todo o estoque, recalcula em centavos e acompanha o usuario autenticado', async () => {
    expect(component.obterOpcoesQuantidade(15)).toHaveLength(15);

    await firstValueFrom(component.adicionarAoCarrinho({
      compradorIdentificador: 2,
      anuncioIdentificador: 99,
      nome: 'Item de Centavos',
      imagem: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
      precoUnitario: 0.29,
      quantidade: 1,
      disponivel: true,
      estoqueDisponivel: 12,
    }));

    app.entrar({
      email: 'teste@geekhub.com',
      senha: 'teste123',
    });
    fixture.detectChanges();

    expect(component.compradorIdentificador).toBe(2);
    expect(component.itensCarrinho).toHaveLength(1);

    const aumentado = await firstValueFrom(component.alterarQuantidade({
      compradorIdentificador: 2,
      anuncioIdentificador: 99,
      quantidade: 3,
    }));
    expect(aumentado.sucesso).toBe(true);
    expect(component.obterSubtotalCentavos(component.itensCarrinho[0])).toBe(87);
    expect(component.valorTotal).toBe(0.87);

    const diminuido = await firstValueFrom(component.alterarQuantidade({
      compradorIdentificador: 2,
      anuncioIdentificador: 99,
      quantidade: 1,
    }));
    expect(diminuido.sucesso).toBe(true);
    expect(component.valorTotal).toBe(0.29);
  });

  it('remove produtos preservando os demais, zera no ultimo e ignora ausente', async () => {
    const removerAusente = await firstValueFrom(component.removerDoCarrinho({
      compradorIdentificador: 1,
      anuncioIdentificador: 999,
    }));
    expect(removerAusente.sucesso).toBe(true);
    expect(component.itensCarrinho).toHaveLength(3);

    component.aoRemover(2);
    expect(component.itensCarrinho.map((item) => item.anuncioIdentificador)).toEqual([1, 3]);
    expect(component.valorTotal).toBe(2106.5);

    component.aoRemover(1);
    component.aoRemover(3);
    expect(component.itensCarrinho).toEqual([]);
    expect(component.valorTotal).toBe(0);
    expect(component.podeAvancar).toBe(false);
  });

  it('navega para revisao apenas com itens disponiveis e quantidades validas', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.avancar();
    expect(navegar).toHaveBeenCalledWith(['/pedidos/revisar']);

    navegar.mockClear();
    app.atualizarDisponibilidadeCarrinho(1, 1, true, 0);
    fixture.detectChanges();

    component.avancar();
    expect(navegar).not.toHaveBeenCalled();

    component.compradorIdentificador = 2;
    component.avancar();
    expect(navegar).not.toHaveBeenCalled();
    expect(component.valorTotal).toBe(0);
  });

  it('exibe imagens validas, reais brasileiros e acesso ao catalogo no estado vazio', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const imagem = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(imagem.getAttribute('src')).toContain('https://');
    expect(fixture.nativeElement.textContent).toContain('2.206,30');

    component.compradorIdentificador = 2;
    fixture.detectChanges();
    await fixture.whenStable();

    const linkCatalogo = fixture.nativeElement.querySelector(
      '.botao-catalogo',
    ) as HTMLAnchorElement;
    expect(linkCatalogo.getAttribute('href')).toBe('/');

    const icone = fixture.nativeElement.querySelector('.icone-vazio') as HTMLElement;
    expect(icone.classList.contains('material-symbols-outlined')).toBe(true);
  });

  it('limpa todos os itens do carrinho ao clicar em Limpar carrinho', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.itensCarrinho.length).toBe(3);

    const botaoLimpar = fixture.nativeElement.querySelector('.botao-limpar-carrinho') as HTMLButtonElement;
    botaoLimpar.click();
    await fixture.whenStable();

    expect(component.itensCarrinho).toEqual([]);
    expect(component.valorTotal).toBe(0);
  });
});

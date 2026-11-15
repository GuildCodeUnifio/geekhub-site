import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CarrinhoModule } from '../carrinho-module';
import { CarrinhoComponente } from './carrinho.componente';

describe('CarrinhoComponente', () => {
  let component: CarrinhoComponente;
  let fixture: ComponentFixture<CarrinhoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrinhoModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CarrinhoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('soma o mesmo anúncio e separa os compradores', () => {
    const item = component.itensCarrinho[0];
    component.adicionarItem(1, item, 2);
    expect(component.itensCarrinho).toHaveLength(3);
    expect(item.quantidade).toBe(3);
    component.adicionarItem(2, item, 1);
    expect(component.consultarCarrinho(2)[0].quantidade).toBe(1);
    expect(item.quantidade).toBe(3);
    component.adicionarItem(1, item, 3);
    expect(item.quantidade).toBe(3);
    expect(component.mensagem).not.toBe('');
  });

  it('recusa quantidades inválidas e preserva a linha', () => {
    const item = component.itensCarrinho[0];
    for (const quantidade of [0, -1, 1.5, NaN, 6]) {
      component.alterarQuantidade(item, quantidade);
      expect(item.quantidade).toBe(1);
      expect(component.mensagem).not.toBe('');
      component.adicionarItem(1, item, quantidade);
      expect(item.quantidade).toBe(1);
    }
    item.disponivel = false;
    component.alterarQuantidade(item, 2);
    component.adicionarItem(1, item, 1);
    expect(item.quantidade).toBe(1);
    expect(component.itensCarrinho).toContain(item);
    expect(component.podeAvancar).toBe(false);
  });

  it('oferece todo o estoque e calcula os valores em centavos', () => {
    expect(component.obterOpcoesQuantidade(15)).toHaveLength(15);
    const item = component.itensCarrinho[0];
    item.preco = 0.29;
    component.alterarQuantidade(item, 3);
    expect(component.obterSubtotalCentavos(item)).toBe(87);
    expect(component.valorTotal).toBe(497.37);
    component.alterarQuantidade(item, 1);
    expect(component.valorTotal).toBe(496.79);
  });

  it('navega apenas com itens disponíveis e quantidades válidas', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.avancar();
    expect(navegar).toHaveBeenCalledWith(['/pedidos/revisar']);
    navegar.mockClear();
    component.itensCarrinho[0].estoqueDisponivel = 0;
    component.avancar();
    expect(navegar).not.toHaveBeenCalled();
    component.compradorIdentificador = 2;
    component.avancar();
    expect(navegar).not.toHaveBeenCalled();
    expect(component.valorTotal).toBe(0);
  });

  it('exibe imagens, reais brasileiros e acesso ao catálogo no estado vazio', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toContain('https://');
    expect(fixture.nativeElement.textContent).toContain('546,40');
    const vazio = TestBed.createComponent(CarrinhoComponente);
    vazio.componentInstance.compradorIdentificador = 2;
    await vazio.whenStable();
    expect(vazio.nativeElement.querySelector('a').getAttribute('href')).toBe('/');
  });
});

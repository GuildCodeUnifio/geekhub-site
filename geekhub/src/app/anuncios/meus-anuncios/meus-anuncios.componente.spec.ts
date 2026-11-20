import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { AnunciosModule } from '../anuncios-module';
import { MeusAnunciosComponente } from './meus-anuncios.componente';

describe('MeusAnunciosComponente', () => {
  let app: App;
  let roteador: Router;
  let component: MeusAnunciosComponente;
  let fixture: ComponentFixture<MeusAnunciosComponente>;

  async function criarComponente(): Promise<void> {
    fixture = TestBed.createComponent(MeusAnunciosComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AnunciosModule],
      providers: [provideRouter([]), App],
    }).compileComponents();

    app = TestBed.inject(App);
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redireciona para o login quando nao ha usuario autenticado', async () => {
    await criarComponente();

    expect(roteador.navigate).toHaveBeenCalledWith(['/entrar'], {
      queryParams: { redirecionar: '/meus-anuncios' },
    });
  });

  it('lista anuncios criados pelo usuario e permite excluir com confirmacao', async () => {
    const usuario = app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    const criado = app.cadastrarAnuncio(usuario!.identificador, {
      nome: 'Caneca Pokebola',
      descricao: 'Ceramica 350ml',
      categoriaIdentificador: 4,
      preco: 59.9,
      estoque: 4,
      estado: 'Novo',
      conservacao: 'Excelente',
      imagens: ['https://picsum.photos/300'],
    });
    expect(criado.sucesso).toBe(true);

    await criarComponente();

    expect(component.resposta?.anuncios).toHaveLength(1);
    expect(component.resposta?.anuncios[0].nome).toBe('Caneca Pokebola');

    const id = criado.anuncio!.identificador;
    component.solicitarExclusao(id);
    expect(component.confirmandoExclusaoId).toBe(id);

    component.confirmarExclusao(id);
    await fixture.whenStable();

    expect(component.resposta?.total).toBe(0);
    expect(app.buscarAnuncio(id)).toBeNull();
  });

  it('impede exclusao de anuncio vinculado a pedido e permite visao admin', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    expect(component.ehAdmin).toBe(true);
    component.alternarVisaoAdmin(true);
    await fixture.whenStable();

    expect(component.resposta?.total).toBeGreaterThanOrEqual(11);

    component.confirmarExclusao(1);
    await fixture.whenStable();

    expect(component.erro).toContain('vinculado a pedidos');
    expect(app.buscarAnuncio(1)).not.toBeNull();
  });
});

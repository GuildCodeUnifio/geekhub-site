import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from '../../app';
import { AnunciosModule } from '../anuncios-module';
import { FormularioAnuncioComponente } from './formulario-anuncio.componente';

describe('FormularioAnuncioComponente', () => {
  let paramId: string | null = null;
  let app: App;
  let roteador: Router;
  let component: FormularioAnuncioComponente;
  let fixture: ComponentFixture<FormularioAnuncioComponente>;

  async function criarComponente(id: string | null = null): Promise<void> {
    paramId = id;
    fixture = TestBed.createComponent(FormularioAnuncioComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    paramId = null;

    await TestBed.configureTestingModule({
      imports: [AnunciosModule],
      providers: [
        provideRouter([]),
        App,
        {
          provide: ActivatedRoute,
          useValue: {
            get snapshot() {
              return { paramMap: convertToParamMap(paramId ? { id: paramId } : {}) };
            },
          },
        },
      ],
    }).compileComponents();

    app = TestBed.inject(App);
    roteador = TestBed.inject(Router);
    vi.spyOn(roteador, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('cadastra um novo anuncio valido e disponibiliza no catalogo', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.nome = 'Console Mega Drive Mini';
    component.descricao = 'Edicao comemorativa completa';
    component.categoriaIdentificador = 3;
    component.preco = 499.9;
    component.estoque = 2;
    component.estado = 'Novo';
    component.conservacao = 'Excelente';
    component.novaImagemUrl = 'https://picsum.photos/400';

    component.salvar();
    await fixture.whenStable();

    expect(component.erro).toBe('');
    expect(roteador.navigate).toHaveBeenCalledWith(['/meus-anuncios']);

    const buscado = app.consultarAnuncios({ termo: 'Mega Drive Mini' });
    expect(buscado.total).toBe(1);
    const detalhe = app.buscarAnuncio(buscado.anuncios[0].identificador);
    expect(detalhe?.vendedor).not.toHaveProperty('email');
    expect(detalhe?.vendedor.nome).toBe('Usuário GeekHub');
  });

  it('edita anuncio proprio e bloqueia edicao de anuncio de outro vendedor', async () => {
    const demo = app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    const criado = app.cadastrarAnuncio(demo!.identificador, {
      nome: 'Livro RPG D&D',
      descricao: 'Capa dura',
      categoriaIdentificador: 3,
      preco: 150,
      estoque: 3,
      estado: 'Usado',
      conservacao: 'Bom',
      imagens: ['https://picsum.photos/401'],
    });

    await criarComponente(String(criado.anuncio!.identificador));
    expect(component.ehEdicao).toBe(true);
    expect(component.nome).toBe('Livro RPG D&D');

    component.preco = 129.9;
    component.disponivel = false;
    component.salvar();
    await fixture.whenStable();

    const atualizado = app.buscarAnuncio(criado.anuncio!.identificador);
    expect(atualizado?.preco).toBe(129.9);
    expect(atualizado?.disponivel).toBe(false);

    await criarComponente('1');
    expect(component.bloqueado).toBe(true);
    expect(component.erro).toContain('próprios anúncios');
  });

  it('valida URL de imagem e campos obrigatorios antes de salvar', async () => {
    app.entrar({ email: 'demo@geekhub.com', senha: '123456' });
    await criarComponente();

    component.nome = 'Item Teste';
    component.descricao = 'Descricao valida';
    component.preco = 50;
    component.novaImagemUrl = 'ftp://invalida';

    component.salvar();
    expect(component.erro).toContain('URL de imagem válida');
  });
});

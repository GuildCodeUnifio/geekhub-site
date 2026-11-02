import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AutenticacaoModule } from '../autenticacao-module';
import { CadastroComponente } from './cadastro.componente';

describe('CadastroComponente', () => {
  let component: CadastroComponente;
  let mensagens: string[];
  let navegacoes: string[][];

  beforeEach(() => {
    mensagens = [];
    navegacoes = [];

    TestBed.configureTestingModule({
      imports: [AutenticacaoModule],
      providers: [
        CadastroComponente,
        {
          provide: Router,
          useValue: {
            navigate: (destino: string[]) => {
              navegacoes.push(destino);
              return Promise.resolve(true);
            },
          },
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: (mensagem: string) => {
              mensagens.push(mensagem);
            },
          },
        },
      ],
    });

    component = TestBed.inject(CadastroComponente);
  });

  it('cadastra a conta e retorna o usuario sem senha', () => {
    const quantidadeInicial = component['usuarios'].length;

    const resultado = component.cadastrarUsuario({
      nome: '  Pessoa Teste  ',
      email: '  TESTE@GEEKHUB.EXAMPLE  ',
      senha: ' demo123 ',
      confirmacaoSenha: ' demo123 ',
    });

    expect(resultado.sucesso).toBe(true);
    expect(resultado.mensagem).toBe('Conta criada com sucesso!');

    expect(resultado.usuario).toEqual({
      id: expect.any(String),
      nome: 'Pessoa Teste',
      email: 'teste@geekhub.example',
    });

    expect(resultado.usuario).not.toHaveProperty('senha');
    expect(resultado.usuario).not.toHaveProperty('confirmacaoSenha');

    const usuarios = component['usuarios'];

    expect(usuarios.length).toBe(quantidadeInicial + 1);

    const contaCriada = usuarios[usuarios.length - 1];

    expect(contaCriada.id).not.toBe('1');
    expect(contaCriada.nome).toBe('Pessoa Teste');
    expect(contaCriada.email).toBe('teste@geekhub.example');
    expect(contaCriada.senha).toBe(' demo123 ');
    expect(contaCriada).not.toHaveProperty('confirmacaoSenha');
  });

  it('insere uma unica conta mesmo ao tentar cadastrar duas vezes', () => {
    component.nome = 'Pessoa Teste';
    component.email = 'teste@geekhub.example';
    component.senha = 'demo123';
    component.confirmacaoSenha = 'demo123';

    const quantidadeInicial = component['usuarios'].length;

    component.cadastrar();
    component.cadastrar();

    expect(component['usuarios'].length).toBe(quantidadeInicial + 1);
    expect(mensagens).toEqual(['Conta criada com sucesso!']);
    expect(navegacoes).toEqual([['/entrar']]);
    expect(component.cadastroConcluido).toBe(true);
  });
});
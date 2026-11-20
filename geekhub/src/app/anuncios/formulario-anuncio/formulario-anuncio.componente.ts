import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';

import {
  App,
  OPCOES_CONSERVACAO,
  type CategoriaResponse,
  type SalvarAnuncioRequest,
} from '../../app';

const REGEX_URL_HTTP = /^https?:\/\/.+/i;

@Component({
  selector: 'app-formulario-anuncio',
  standalone: false,
  templateUrl: './formulario-anuncio.componente.html',
  styleUrl: './formulario-anuncio.componente.scss',
})
export class FormularioAnuncioComponente implements OnInit {
  private readonly app = inject(App);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly opcoesEstado: readonly ('Novo' | 'Usado')[] = ['Novo', 'Usado'];
  readonly opcoesConservacao = OPCOES_CONSERVACAO;

  categorias: CategoriaResponse[] = [];
  anuncioIdentificador: number | null = null;

  nome = '';
  descricao = '';
  categoriaIdentificador: number | null = null;
  preco: number | null = null;
  estoque: number | null = 1;
  disponivel = true;
  estado: 'Novo' | 'Usado' = 'Novo';
  conservacao = 'Excelente';
  novaImagemUrl = '';
  imagens: string[] = [];

  carregando = false;
  salvando = false;
  bloqueado = false;
  erro = '';
  mensagem = '';

  private carregamentoAtual?: Subscription;

  get ehEdicao(): boolean {
    return this.anuncioIdentificador !== null;
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.carregamentoAtual?.unsubscribe());

    const usuario = this.app.usuarioAtual;
    if (!usuario) {
      void this.roteador.navigate(['/entrar'], {
        queryParams: { redirecionar: '/meus-anuncios' },
      });
      return;
    }

    const parametroId = this.rota.snapshot.paramMap.get('id');
    if (parametroId !== null) {
      const id = Number(parametroId);
      if (!Number.isInteger(id) || id < 1) {
        this.erro = 'Anúncio não encontrado.';
        this.bloqueado = true;
        return;
      }
      this.anuncioIdentificador = id;
    }

    this.carregando = true;
    this.carregamentoAtual = forkJoin({
      categorias: this.app.dados.listarCategorias(),
      anuncio:
        this.anuncioIdentificador !== null
          ? this.app.dados.buscarAnuncio(this.anuncioIdentificador)
          : of(null),
    }).subscribe({
      next: ({ categorias, anuncio }) => {
        this.categorias = categorias;
        this.carregando = false;

        if (this.anuncioIdentificador !== null) {
          if (!anuncio) {
            this.erro = 'Anúncio não encontrado.';
            this.bloqueado = true;
            this.detector.markForCheck();
            return;
          }

          if (anuncio.vendedor.identificador !== usuario.identificador) {
            this.erro = 'Você só pode editar seus próprios anúncios.';
            this.bloqueado = true;
            this.detector.markForCheck();
            return;
          }

          this.nome = anuncio.nome;
          this.descricao = anuncio.descricao;
          this.categoriaIdentificador =
            anuncio.categoriaIdentificador ??
            categorias.find(cat => cat.nome === anuncio.categoria)?.identificador ??
            categorias[0]?.identificador ??
            null;
          this.preco = anuncio.preco;
          this.estoque = anuncio.estoque;
          this.disponivel = anuncio.disponivel ?? anuncio.estoque > 0;
          this.estado = anuncio.estado;
          this.conservacao = this.normalizarConservacao(anuncio.conservacao);
          this.imagens = [...anuncio.imagens];
        } else if (categorias.length > 0 && this.categoriaIdentificador === null) {
          this.categoriaIdentificador = categorias[0].identificador;
        }

        this.detector.markForCheck();
      },
      error: (erro: Error) => {
        this.carregando = false;
        this.erro = erro.message;
        this.detector.markForCheck();
      },
    });
  }

  adicionarImagem(): void {
    const url = this.novaImagemUrl.trim();
    if (!url) {
      return;
    }

    if (!REGEX_URL_HTTP.test(url) || url.length > 512) {
      this.erro = 'Informe uma URL de imagem válida iniciando com http:// ou https://.';
      return;
    }

    if (!this.imagens.includes(url)) {
      this.imagens = [...this.imagens, url];
    }

    this.novaImagemUrl = '';
    this.erro = '';
  }

  removerImagem(indice: number): void {
    this.imagens = this.imagens.filter((_, pos) => pos !== indice);
  }

  salvar(): void {
    const usuario = this.app.usuarioAtual;
    if (!usuario || this.salvando || this.bloqueado) {
      return;
    }

    const erroUrlPendente = this.incorporarImagemPendente();
    if (erroUrlPendente) {
      this.erro = erroUrlPendente;
      return;
    }

    const erroValidacao = this.validarFormulario();
    if (erroValidacao) {
      this.erro = erroValidacao;
      return;
    }

    const payload: SalvarAnuncioRequest = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim(),
      categoriaIdentificador: this.categoriaIdentificador as number,
      preco: Number(this.preco),
      estoque: Number(this.estoque),
      ...(this.ehEdicao ? { disponivel: this.disponivel } : {}),
      estado: this.estado,
      conservacao: this.conservacao,
      imagens: [...this.imagens],
    };

    this.salvando = true;
    this.erro = '';
    this.mensagem = '';

    const operacao$ =
      this.anuncioIdentificador !== null
        ? this.app.dados.editarAnuncio(
            this.anuncioIdentificador,
            usuario.identificador,
            payload,
          )
        : this.app.dados.cadastrarAnuncio(usuario.identificador, payload);

    operacao$.subscribe({
      next: resultado => {
        this.salvando = false;
        if (!resultado.sucesso) {
          this.erro = resultado.mensagem;
          this.detector.markForCheck();
          return;
        }

        this.mensagem = resultado.mensagem;
        this.detector.markForCheck();
        void this.roteador.navigate(['/meus-anuncios']);
      },
      error: (erro: Error) => {
        this.salvando = false;
        this.erro = erro.message;
        this.detector.markForCheck();
      },
    });
  }

  private incorporarImagemPendente(): string | null {
    const pendente = this.novaImagemUrl.trim();
    if (!pendente) {
      return null;
    }

    if (!REGEX_URL_HTTP.test(pendente) || pendente.length > 512) {
      return 'Informe uma URL de imagem válida iniciando com http:// ou https://.';
    }

    if (!this.imagens.includes(pendente)) {
      this.imagens = [...this.imagens, pendente];
    }

    this.novaImagemUrl = '';
    return null;
  }

  private validarFormulario(): string | null {
    if (!this.nome.trim() || this.nome.trim().length > 255) {
      return 'Informe o nome do produto.';
    }
    if (!this.descricao.trim() || this.descricao.trim().length > 2000) {
      return 'Informe a descrição do produto.';
    }
    if (!this.categoriaIdentificador) {
      return 'Selecione uma categoria.';
    }
    if (this.preco === null || !Number.isFinite(this.preco) || this.preco <= 0) {
      return 'Informe um preço válido maior que zero.';
    }
    const estoqueMinimo = this.ehEdicao ? 0 : 1;
    if (
      this.estoque === null ||
      !Number.isInteger(Number(this.estoque)) ||
      Number(this.estoque) < estoqueMinimo
    ) {
      return this.ehEdicao
        ? 'O estoque deve ser um inteiro maior ou igual a zero.'
        : 'Informe o estoque inicial (mínimo 1).';
    }
    if (this.imagens.length === 0) {
      return 'Adicione ao menos uma URL de imagem do produto.';
    }
    return null;
  }

  private normalizarConservacao(valor: string): string {
    const encontrado = OPCOES_CONSERVACAO.find(
      item => item.toLowerCase() === valor.trim().toLowerCase(),
    );
    return encontrado ?? 'Bom';
  }
}

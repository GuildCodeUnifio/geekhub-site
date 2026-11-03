# Como contribuir

O fluxo da equipe utiliza apenas `main` e branches `feature/nome-da-feature`.
Cada alteração parte da `main` e retorna para ela por meio de um pull request.
Não utilizamos uma branch `develop`.

## 1. Criar uma branch

Atualize a `main` antes de começar e crie uma branch para a tarefa:

```bash
git switch main
git pull origin main
git switch -c feature/nome-da-feature
```

Use nomes curtos, descritivos e separados por hífens, por exemplo:
`feature/product-catalog` ou `feature/user-login`.

## 2. Desenvolver e validar

Mantenha cada branch focada em uma tarefa. Antes de abrir o pull request,
confira as alterações e execute as verificações relevantes. Para mudanças no
código da aplicação, execute na pasta `geekhub/`:

```bash
npm run build
npm test -- --watch=false
```

Para alterações de interface, confira também a navegação e a apresentação
em telas de computador e celular.

## 3. Enviar as alterações

Adicione apenas os arquivos da tarefa e faça commits com mensagens claras:

```bash
git add caminho/do/arquivo
git commit -m "feat: add product catalog"
git push -u origin feature/nome-da-feature
```

## 4. Abrir um pull request

- Abra o pull request da sua branch `feature/...` para `main`.
- Descreva o que mudou e quais verificações foram realizadas.
- Inclua capturas de tela quando houver mudanças visuais.
- Solicite a revisão de outro integrante e resolva os comentários antes do merge.
- Após o merge, exclua a branch da tarefa e atualize sua `main` local.

Fluxo resumido:

```text
main → feature/nome-da-feature → pull request → main
```

# desafio_teste_batalha_naval

Batalha naval em JavaScript com casos de teste em JavaScript (Jest).

## Colaborador

- Gabriel Carvalho | RA: 24027655-2

## Especificação

- Tabuleiro (oceano) de 10 x 10. As linhas vão de A a J e as colunas de 1 a 10, como no jogo de papel: `A1`, `C7`, `J10`.
- Cada jogador tem uma frota de 4 navios:
  - 1 porta-aviões (5 casas)
  - 1 encouraçado (4 casas)
  - 1 submarino (3 casas)
  - 1 destroier ou hidroavião (2 casas)
- Os navios ficam na horizontal (`H`) ou na vertical (`V`), dentro do tabuleiro, sem ficar um em cima do outro e **sem encostar em outro navio, nem na diagonal**.
- A frota pode ser montada à mão (`alocarNavio`) ou sorteada (`alocarAleatoriamente`). Antes do primeiro disparo dá para tirar um navio e colocar em outro lugar.
- Cada disparo responde `agua`, `acerto` ou `afundou`. Não pode disparar duas vezes na mesma casa.
- Na partida, o jogador 1 começa. **Quem acerta joga de novo**; quem erra passa a vez.
- Vence quem afundar a frota inteira do adversário primeiro.

## Contrato da implementação

O jogo fica em `src/batalhaNaval.js` (CommonJS) e é importado nos testes com `require('../src/batalhaNaval')`:

```js
module.exports = { Oceano, Partida, FROTA, TAMANHO, lerCoordenada, escreverCoordenada };
```

- `TAMANHO`: `10`.
- `FROTA`: lista dos 4 navios no formato `{ id, nome, tamanho }`, com os ids `'porta-avioes'` (5), `'encouracado'` (4), `'submarino'` (3) e `'destroier'` (2).
- `lerCoordenada(texto)`: converte `'C7'` em `{ linha: 2, coluna: 6 }`. Aceita minúsculas e espaços nas pontas. Coordenada fora de `A1`–`J10`: mensagem com `"Coordenada inválida"`.
- `escreverCoordenada(linha, coluna)`: faz o contrário, `(2, 6)` vira `'C7'`.

### `new Oceano()`

Tabuleiro de um jogador, começando vazio.

- `alocarNavio(id, inicio, direcao)`: coloca o navio a partir da coordenada `inicio`, para a direita (`'H'`) ou para baixo (`'V'`). Devolve a lista das coordenadas ocupadas.
- `removerNavio(id)`: tira o navio do tabuleiro.
- `alocarAleatoriamente(aleatorio?, maxTentativas?)`: sorteia a posição dos navios que faltam. `aleatorio` é uma função que devolve um número entre 0 e 1 (padrão: `Math.random`).
- `frotaCompleta()`: `true` quando os 4 navios estão alocados.
- `ocupante(coordenada)`: id do navio na casa, ou `null`.
- `disparar(coordenada)`: devolve `{ resultado, navio }`, com `resultado` igual a `'agua'`, `'acerto'` ou `'afundou'` e `navio` igual ao id atingido (ou `null` na água).
- `afundados()`: ids dos navios afundados, na ordem da `FROTA`.
- `frotaAfundada()`: `true` quando os 4 navios afundaram.
- `desenhar({ mostrarNavios })`: lista de 10 textos: `~` sem disparo, `o` água atingida, `X` navio atingido e, se `mostrarNavios` for `true`, `N` para navio ainda inteiro.

Erros do `Oceano` (mensagens contêm o trecho entre aspas):

- navio que não existe na frota: `"desconhecido"`; navio já alocado: `"já foi alocado"`; direção diferente de `H` ou `V`: `"direção"`;
- navio saindo do tabuleiro: `"sai do tabuleiro"`; em cima de outro: `"em cima de outro navio em <casa>"`; encostando em outro, inclusive na diagonal: `"encostado"`;
- remover navio que não está no tabuleiro: `"não está no tabuleiro"`;
- alocar ou remover depois do primeiro disparo: `"depois do primeiro disparo"`;
- disparar com a frota incompleta: `"frota ainda não está completa"`; repetir uma casa: `"Já houve disparo em <casa>"`;
- sorteio que não encontra lugar para um navio: `"Não foi possível alocar"`.

### `new Partida(oceanoJogador1, oceanoJogador2)`

Os dois oceanos precisam estar com a frota completa (senão, mensagem com `"frota completa"`).

- `vez`: jogador da vez (`1` ou `2`), começando pelo `1`.
- `vencedor`: `null` até alguém afundar a frota inteira do adversário.
- `historico`: lista de `{ jogador, coordenada, resultado, navio }`.
- `disparar(coordenada)`: o jogador da vez dispara no oceano do adversário e recebe o mesmo retorno de `Oceano.disparar`. Na água, a vez passa; acertando, joga de novo. Depois do fim: mensagem com `"já terminou"`.

## Casos de teste

Os testes usam duas frotas fixas, desenhadas no começo do arquivo de testes, e um gerador com semente para as partes sorteadas, para que o resultado seja sempre o mesmo.

O que é testado:

- tamanho do tabuleiro e composição da frota (4 navios, 14 casas);
- leitura e escrita de coordenadas (`A1` a `J10`, minúsculas e coordenadas inválidas);
- alocação: horizontal, vertical, navio desconhecido ou repetido, direção inválida, navio saindo do tabuleiro, um em cima do outro, encostado (do lado e na diagonal) e remover e realocar;
- alocação aleatória com várias sementes: frota completa e nenhum navio encostado;
- disparos: água, acerto, afundou, casa repetida, coordenada inválida, frota incompleta e o desenho do oceano;
- partida: quem começa, troca de vez, jogar de novo ao acertar, histórico, vitória de cada jogador e uma partida inteira sorteada.

São 49 casos de teste. Uma implementação correta deve terminar com `Tests: 49 passed, 49 total`.

## Como rodar

Precisa do Node.js 18 ou mais novo.

```bash
npm install
```

```bash
npm test
```

Para ver a cobertura dos testes:

```bash
npm run coverage
```

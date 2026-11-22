# desafio_teste_batalha_naval

Batalha naval em JavaScript com casos de teste em JavaScript (Jest).

**Colaborador:** Gabriel Carvalho

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

O jogo fica em `src/batalhaNaval.js` (classes `Oceano` e `Partida`) e os testes em `__tests__/batalhaNaval.spec.js`.

## Casos de teste

Os testes usam duas frotas fixas, desenhadas no começo do arquivo de testes, e um gerador com semente para as partes sorteadas, para que o resultado seja sempre o mesmo.

O que é testado:

- tamanho do tabuleiro e composição da frota (4 navios, 14 casas);
- leitura e escrita de coordenadas (`A1` a `J10`, minúsculas e coordenadas inválidas);
- alocação: horizontal, vertical, navio desconhecido ou repetido, direção inválida, navio saindo do tabuleiro, um em cima do outro, encostado (do lado e na diagonal) e remover e realocar;
- alocação aleatória com várias sementes: frota completa e nenhum navio encostado;
- disparos: água, acerto, afundou, casa repetida, coordenada inválida, frota incompleta e o desenho do oceano;
- partida: quem começa, troca de vez, jogar de novo ao acertar, histórico, vitória de cada jogador e uma partida inteira sorteada.

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

const {
  Oceano, Partida, FROTA, TAMANHO, lerCoordenada, escreverCoordenada,
} = require('../src/batalhaNaval');

// Gerador xorshift com semente, para sorteios repetíveis.
function sorteioComSemente(semente) {
  let x = semente || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

// Frota do jogador 1:
//    1 2 3 4 5 6 7 8 9 10
// A  N N N N N . . . . .    porta-aviões  A1 -> A5
// C  N . . . . . . . . .    encouraçado   C1 -> F1
// E  N . . . N . . . . .    destroier     E5 -> F5
// F  N . . . N . . . . .
// J  . . . . . . . N N N    submarino     J8 -> J10
function oceanoJogador1() {
  const oceano = new Oceano();
  oceano.alocarNavio('porta-avioes', 'A1', 'H');
  oceano.alocarNavio('encouracado', 'C1', 'V');
  oceano.alocarNavio('submarino', 'J8', 'H');
  oceano.alocarNavio('destroier', 'E5', 'V');
  return oceano;
}

// Frota do jogador 2: porta-aviões B2 -> F2, encouraçado H5 -> H8,
// submarino A9 -> C9 e destroier J1 -> J2.
function oceanoJogador2() {
  const oceano = new Oceano();
  oceano.alocarNavio('porta-avioes', 'B2', 'V');
  oceano.alocarNavio('encouracado', 'H5', 'H');
  oceano.alocarNavio('submarino', 'A9', 'V');
  oceano.alocarNavio('destroier', 'J1', 'H');
  return oceano;
}

const CASAS_JOGADOR_1 = ['A1', 'A2', 'A3', 'A4', 'A5', 'C1', 'D1', 'E1', 'F1', 'J8', 'J9', 'J10', 'E5', 'F5'];
const CASAS_JOGADOR_2 = ['B2', 'C2', 'D2', 'E2', 'F2', 'H5', 'H6', 'H7', 'H8', 'A9', 'B9', 'C9', 'J1', 'J2'];

function todasAsCoordenadas() {
  const lista = [];
  for (let l = 0; l < TAMANHO; l++) {
    for (let c = 0; c < TAMANHO; c++) lista.push(escreverCoordenada(l, c));
  }
  return lista;
}

describe('Tabuleiro e frota', () => {
  test('o tabuleiro é 10 x 10', () => {
    expect(TAMANHO).toBe(10);
    expect(new Oceano().desenhar()).toEqual(Array(10).fill('~~~~~~~~~~'));
  });

  test('a frota tem os 4 navios do desafio', () => {
    expect(FROTA.map((n) => [n.id, n.tamanho])).toEqual([
      ['porta-avioes', 5],
      ['encouracado', 4],
      ['submarino', 3],
      ['destroier', 2],
    ]);
    expect(FROTA.reduce((soma, n) => soma + n.tamanho, 0)).toBe(14);
  });
});

describe('Coordenadas', () => {
  test.each([
    ['A1', 0, 0], ['J10', 9, 9], ['c7', 2, 6], [' E5 ', 4, 4],
  ])('"%s" corresponde à linha %i, coluna %i', (texto, linha, coluna) => {
    expect(lerCoordenada(texto)).toEqual({ linha, coluna });
  });

  test.each(['K1', 'A0', 'A11', '1A', '', 'B'])('"%s" é inválida', (texto) => {
    expect(() => lerCoordenada(texto)).toThrow('Coordenada inválida');
  });

  test('converte linha e coluna de volta para texto', () => {
    expect(escreverCoordenada(0, 0)).toBe('A1');
    expect(escreverCoordenada(9, 9)).toBe('J10');
    expect(escreverCoordenada(2, 6)).toBe('C7');
  });
});

describe('Alocação dos navios', () => {
  test('aloca na horizontal e na vertical', () => {
    const oceano = new Oceano();
    expect(oceano.alocarNavio('submarino', 'B3', 'H')).toEqual(['B3', 'B4', 'B5']);
    expect(oceano.alocarNavio('destroier', 'F10', 'V')).toEqual(['F10', 'G10']);
    expect(oceano.ocupante('B4')).toBe('submarino');
    expect(oceano.ocupante('G10')).toBe('destroier');
    expect(oceano.ocupante('A1')).toBeNull();
  });

  test('a frota fixa do jogador 1 fica como o desenho', () => {
    expect(oceanoJogador1().desenhar({ mostrarNavios: true })).toEqual([
      'NNNNN~~~~~',
      '~~~~~~~~~~',
      'N~~~~~~~~~',
      'N~~~~~~~~~',
      'N~~~N~~~~~',
      'N~~~N~~~~~',
      '~~~~~~~~~~',
      '~~~~~~~~~~',
      '~~~~~~~~~~',
      '~~~~~~~NNN',
    ]);
  });

  test('a frota só fica completa com os 4 navios', () => {
    const oceano = new Oceano();
    oceano.alocarNavio('porta-avioes', 'A1', 'H');
    oceano.alocarNavio('encouracado', 'C1', 'V');
    oceano.alocarNavio('submarino', 'J8', 'H');
    expect(oceano.frotaCompleta()).toBe(false);
    oceano.alocarNavio('destroier', 'E5', 'V');
    expect(oceano.frotaCompleta()).toBe(true);
  });

  test('não aceita navio desconhecido nem o mesmo navio duas vezes', () => {
    const oceano = new Oceano();
    expect(() => oceano.alocarNavio('canoa', 'A1', 'H')).toThrow('desconhecido');
    oceano.alocarNavio('destroier', 'A1', 'H');
    expect(() => oceano.alocarNavio('destroier', 'E5', 'H')).toThrow('já foi alocado');
  });

  test('não aceita direção diferente de H ou V', () => {
    expect(() => new Oceano().alocarNavio('destroier', 'A1', 'diagonal')).toThrow('direção');
  });

  test('não deixa o navio sair do tabuleiro', () => {
    const oceano = new Oceano();
    expect(() => oceano.alocarNavio('porta-avioes', 'A7', 'H')).toThrow('sai do tabuleiro');
    expect(() => oceano.alocarNavio('encouracado', 'H1', 'V')).toThrow('sai do tabuleiro');
    expect(oceano.alocarNavio('porta-avioes', 'A6', 'H')).toEqual(['A6', 'A7', 'A8', 'A9', 'A10']);
  });

  test('não deixa um navio em cima de outro', () => {
    const oceano = new Oceano();
    oceano.alocarNavio('porta-avioes', 'C1', 'H');
    expect(() => oceano.alocarNavio('encouracado', 'A3', 'V')).toThrow('em cima de outro navio em C3');
  });

  test('não deixa um navio encostar em outro, nem na diagonal', () => {
    const oceano = new Oceano();
    oceano.alocarNavio('submarino', 'E4', 'H'); // E4, E5, E6
    expect(() => oceano.alocarNavio('destroier', 'F4', 'H')).toThrow('encostado');
    expect(() => oceano.alocarNavio('destroier', 'E7', 'H')).toThrow('encostado');
    expect(() => oceano.alocarNavio('destroier', 'F7', 'V')).toThrow('encostado');
    expect(oceano.alocarNavio('destroier', 'G4', 'H')).toEqual(['G4', 'G5']);
  });

  test('um navio removido pode ser alocado de novo em outro lugar', () => {
    const oceano = new Oceano();
    oceano.alocarNavio('destroier', 'A1', 'H');
    oceano.removerNavio('destroier');
    expect(oceano.ocupante('A1')).toBeNull();
    expect(oceano.alocarNavio('destroier', 'J9', 'H')).toEqual(['J9', 'J10']);
    expect(() => oceano.removerNavio('submarino')).toThrow('não está no tabuleiro');
  });
});

describe('Alocação aleatória', () => {
  test.each([1, 2, 3, 17, 99, 2026])('semente %i: frota completa, 14 casas e nenhum navio encostado', (semente) => {
    const oceano = new Oceano();
    oceano.alocarAleatoriamente(sorteioComSemente(semente));
    expect(oceano.frotaCompleta()).toBe(true);

    const ocupadas = todasAsCoordenadas().filter((coord) => oceano.ocupante(coord) !== null);
    expect(ocupadas).toHaveLength(14);

    for (const coord of ocupadas) {
      const { linha, coluna } = lerCoordenada(coord);
      for (let dl = -1; dl <= 1; dl++) {
        for (let dc = -1; dc <= 1; dc++) {
          const l = linha + dl;
          const c = coluna + dc;
          if (l >= 0 && l < 10 && c >= 0 && c < 10) {
            const vizinho = oceano.ocupante(escreverCoordenada(l, c));
            expect([null, oceano.ocupante(coord)]).toContain(vizinho);
          }
        }
      }
    }
  });

  test('sem gerador informado, usa o sorteio padrão', () => {
    const oceano = new Oceano();
    oceano.alocarAleatoriamente();
    expect(oceano.frotaCompleta()).toBe(true);
  });

  test('a mesma semente gera a mesma frota', () => {
    const a = new Oceano();
    const b = new Oceano();
    a.alocarAleatoriamente(sorteioComSemente(5));
    b.alocarAleatoriamente(sorteioComSemente(5));
    expect(a.desenhar({ mostrarNavios: true })).toEqual(b.desenhar({ mostrarNavios: true }));
  });

  test('mantém os navios que já estavam alocados e completa o resto', () => {
    const oceano = new Oceano();
    oceano.alocarNavio('porta-avioes', 'A1', 'H');
    oceano.alocarAleatoriamente(sorteioComSemente(8));
    expect(oceano.frotaCompleta()).toBe(true);
    expect(oceano.ocupante('A1')).toBe('porta-avioes');
    expect(oceano.ocupante('A5')).toBe('porta-avioes');
  });

  test('avisa quando não consegue alocar', () => {
    const sempreNoCanto = () => 0; // sempre A1 na horizontal
    const oceano = new Oceano();
    expect(() => oceano.alocarAleatoriamente(sempreNoCanto, 20)).toThrow('Não foi possível alocar');
  });
});

describe('Disparos', () => {
  test('tiro na água', () => {
    const oceano = oceanoJogador1();
    expect(oceano.disparar('B5')).toEqual({ resultado: 'agua', navio: null });
  });

  test('tiro que acerta um navio sem afundar', () => {
    const oceano = oceanoJogador1();
    expect(oceano.disparar('A3')).toEqual({ resultado: 'acerto', navio: 'porta-avioes' });
  });

  test('o último acerto afunda o navio', () => {
    const oceano = oceanoJogador1();
    expect(oceano.disparar('E5').resultado).toBe('acerto');
    expect(oceano.disparar('f5')).toEqual({ resultado: 'afundou', navio: 'destroier' });
    expect(oceano.afundados()).toEqual(['destroier']);
  });

  test('não aceita disparar duas vezes na mesma casa', () => {
    const oceano = oceanoJogador1();
    oceano.disparar('D4');
    expect(() => oceano.disparar('d4')).toThrow('Já houve disparo em D4');
  });

  test('não aceita disparo com coordenada inválida', () => {
    expect(() => oceanoJogador1().disparar('Z9')).toThrow('Coordenada inválida');
  });

  test('não aceita disparo antes de a frota estar completa', () => {
    const oceano = new Oceano();
    oceano.alocarNavio('destroier', 'A1', 'H');
    expect(() => oceano.disparar('A1')).toThrow('frota ainda não está completa');
  });

  test('depois do primeiro disparo não dá para mexer nos navios', () => {
    const oceano = oceanoJogador1();
    oceano.disparar('B5');
    expect(() => oceano.removerNavio('destroier')).toThrow('depois do primeiro disparo');
    expect(() => oceano.alocarNavio('submarino', 'H8', 'H')).toThrow('depois do primeiro disparo');
  });

  test('a frota está afundada só depois de acertar as 14 casas', () => {
    const oceano = oceanoJogador1();
    CASAS_JOGADOR_1.slice(0, 13).forEach((coord) => oceano.disparar(coord));
    expect(oceano.frotaAfundada()).toBe(false);
    oceano.disparar(CASAS_JOGADOR_1[13]);
    expect(oceano.frotaAfundada()).toBe(true);
    expect(oceano.afundados()).toEqual(['porta-avioes', 'encouracado', 'submarino', 'destroier']);
  });

  test('o desenho mostra água atingida e acertos, escondendo o resto da frota', () => {
    const oceano = oceanoJogador1();
    oceano.disparar('A1');
    oceano.disparar('B1');
    const desenho = oceano.desenhar();
    expect(desenho[0]).toBe('X~~~~~~~~~');
    expect(desenho[1]).toBe('o~~~~~~~~~');
    expect(desenho[2]).toBe('~~~~~~~~~~');
    expect(oceano.desenhar({ mostrarNavios: true })[0]).toBe('XNNNN~~~~~');
  });
});

describe('Partida entre 2 jogadores', () => {
  test('só começa com as duas frotas completas', () => {
    expect(() => new Partida(oceanoJogador1(), new Oceano())).toThrow('frota completa');
  });

  test('o jogador 1 começa e, ao errar, passa a vez', () => {
    const partida = new Partida(oceanoJogador1(), oceanoJogador2());
    expect(partida.vez).toBe(1);
    expect(partida.disparar('A1').resultado).toBe('agua'); // A1 está livre no oceano do jogador 2
    expect(partida.vez).toBe(2);
  });

  test('quem acerta joga de novo', () => {
    const partida = new Partida(oceanoJogador1(), oceanoJogador2());
    partida.disparar('B2');
    expect(partida.vez).toBe(1);
    partida.disparar('J1');
    partida.disparar('J2'); // afunda o destroier
    expect(partida.vez).toBe(1);
  });

  test('cada jogador dispara no oceano do adversário', () => {
    const p1 = oceanoJogador1();
    const p2 = oceanoJogador2();
    const partida = new Partida(p1, p2);
    partida.disparar('G7'); // jogador 1 erra no oceano do jogador 2
    partida.disparar('A1'); // jogador 2 acerta o porta-aviões do jogador 1
    expect(p2.desenhar()[6][6]).toBe('o');
    expect(p1.desenhar()[0][0]).toBe('X');
  });

  test('o histórico registra quem disparou, onde e o resultado', () => {
    const partida = new Partida(oceanoJogador1(), oceanoJogador2());
    partida.disparar('h5');
    partida.disparar('A1');
    expect(partida.historico).toEqual([
      { jogador: 1, coordenada: 'H5', resultado: 'acerto', navio: 'encouracado' },
      { jogador: 1, coordenada: 'A1', resultado: 'agua', navio: null },
    ]);
  });

  test('vence quem afunda a frota inteira do adversário', () => {
    const partida = new Partida(oceanoJogador1(), oceanoJogador2());
    CASAS_JOGADOR_2.forEach((coord) => partida.disparar(coord));
    expect(partida.vencedor).toBe(1);
    expect(() => partida.disparar('E10')).toThrow('já terminou');
  });

  test('o jogador 2 também pode vencer', () => {
    const partida = new Partida(oceanoJogador1(), oceanoJogador2());
    partida.disparar('A1'); // jogador 1 erra
    CASAS_JOGADOR_1.forEach((coord) => partida.disparar(coord));
    expect(partida.vencedor).toBe(2);
  });

  test('partida completa com frotas e tiros sorteados termina com um vencedor', () => {
    const sorteio = sorteioComSemente(42);
    const p1 = new Oceano();
    const p2 = new Oceano();
    p1.alocarAleatoriamente(sorteio);
    p2.alocarAleatoriamente(sorteio);
    const partida = new Partida(p1, p2);

    // cada jogador segue a própria lista embaralhada de casas
    const embaralhar = (lista) => {
      const copia = [...lista];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(sorteio() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    };
    const alvos = { 1: embaralhar(todasAsCoordenadas()), 2: embaralhar(todasAsCoordenadas()) };

    while (partida.vencedor === null) {
      partida.disparar(alvos[partida.vez].shift());
    }
    const perdedor = partida.vencedor === 1 ? p2 : p1;
    expect(perdedor.frotaAfundada()).toBe(true);
    expect(partida.historico.filter((t) => t.resultado === 'afundou')).toHaveLength(
      4 + (partida.vencedor === 1 ? p1 : p2).afundados().length,
    );
  });
});

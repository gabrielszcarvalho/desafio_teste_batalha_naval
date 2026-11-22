'use strict';

const TAMANHO = 10;
const LETRAS = 'ABCDEFGHIJ';

const FROTA = Object.freeze([
  Object.freeze({ id: 'porta-avioes', nome: 'Porta-aviões', tamanho: 5 }),
  Object.freeze({ id: 'encouracado', nome: 'Encouraçado', tamanho: 4 }),
  Object.freeze({ id: 'submarino', nome: 'Submarino', tamanho: 3 }),
  Object.freeze({ id: 'destroier', nome: 'Destroier / Hidroavião', tamanho: 2 }),
]);

// 'C7' -> { linha: 2, coluna: 6 }
function lerCoordenada(texto) {
  const m = /^([A-J])(10|[1-9])$/.exec(String(texto).trim().toUpperCase());
  if (!m) throw new Error(`Coordenada inválida: "${texto}" (use de A1 a J10)`);
  return { linha: LETRAS.indexOf(m[1]), coluna: Number(m[2]) - 1 };
}

// (2, 6) -> 'C7'
function escreverCoordenada(linha, coluna) {
  return `${LETRAS[linha]}${coluna + 1}`;
}

class Oceano {
  constructor() {
    // casa -> id do navio que ocupa a casa
    this.casas = Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(null));
    this.tiros = Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(false));
    this.navios = new Map(); // id -> { casas: [[l, c]], acertos }
  }

  // Coloca um navio a partir da casa `inicio`, para a direita ('H') ou para baixo ('V').
  // Retorna as coordenadas ocupadas.
  alocarNavio(id, inicio, direcao) {
    if (this.#emJogo()) throw new Error('Não é possível alocar navios depois do primeiro disparo');
    const tipo = FROTA.find((n) => n.id === id);
    if (!tipo) throw new Error(`Navio desconhecido: "${id}"`);
    if (this.navios.has(id)) throw new Error(`O navio "${id}" já foi alocado`);
    if (direcao !== 'H' && direcao !== 'V') throw new Error('A direção deve ser "H" ou "V"');

    const { linha, coluna } = lerCoordenada(inicio);
    const casas = [];
    for (let i = 0; i < tipo.tamanho; i++) {
      const l = direcao === 'V' ? linha + i : linha;
      const c = direcao === 'H' ? coluna + i : coluna;
      if (l >= TAMANHO || c >= TAMANHO) throw new Error(`O navio "${id}" sai do tabuleiro`);
      casas.push([l, c]);
    }
    const sobreposta = casas.find(([l, c]) => this.casas[l][c] !== null);
    if (sobreposta) {
      const [l, c] = sobreposta;
      throw new Error(`O navio "${id}" ficaria em cima de outro navio em ${escreverCoordenada(l, c)}`);
    }
    for (const [l, c] of casas) {
      if (vizinhas(l, c).some(([vl, vc]) => this.casas[vl][vc] !== null)) {
        throw new Error(`O navio "${id}" ficaria encostado em outro navio em ${escreverCoordenada(l, c)}`);
      }
    }

    for (const [l, c] of casas) this.casas[l][c] = id;
    this.navios.set(id, { casas, acertos: 0 });
    return casas.map(([l, c]) => escreverCoordenada(l, c));
  }

  removerNavio(id) {
    if (this.#emJogo()) throw new Error('Não é possível remover navios depois do primeiro disparo');
    const navio = this.navios.get(id);
    if (!navio) throw new Error(`O navio "${id}" não está no tabuleiro`);
    for (const [l, c] of navio.casas) this.casas[l][c] = null;
    this.navios.delete(id);
  }

  // Aloca os navios que faltam em posições sorteadas.
  alocarAleatoriamente(aleatorio = Math.random, maxTentativas = 1000) {
    for (const tipo of FROTA) {
      if (this.navios.has(tipo.id)) continue;
      let alocado = false;
      for (let t = 0; t < maxTentativas && !alocado; t++) {
        const direcao = aleatorio() < 0.5 ? 'H' : 'V';
        const l = Math.floor(aleatorio() * TAMANHO);
        const c = Math.floor(aleatorio() * TAMANHO);
        try {
          this.alocarNavio(tipo.id, escreverCoordenada(l, c), direcao);
          alocado = true;
        } catch {
          // posição inválida: sorteia de novo
        }
      }
      if (!alocado) throw new Error(`Não foi possível alocar o navio "${tipo.id}"`);
    }
  }

  frotaCompleta() {
    return this.navios.size === FROTA.length;
  }

  ocupante(coordenada) {
    const { linha, coluna } = lerCoordenada(coordenada);
    return this.casas[linha][coluna];
  }

  // Retorna { resultado: 'agua' | 'acerto' | 'afundou', navio }
  disparar(coordenada) {
    if (!this.frotaCompleta()) throw new Error('A frota ainda não está completa');
    const { linha, coluna } = lerCoordenada(coordenada);
    if (this.tiros[linha][coluna]) throw new Error(`Já houve disparo em ${coordenada.toUpperCase()}`);
    this.tiros[linha][coluna] = true;

    const id = this.casas[linha][coluna];
    if (id === null) return { resultado: 'agua', navio: null };

    const navio = this.navios.get(id);
    navio.acertos++;
    const afundou = navio.acertos === navio.casas.length;
    return { resultado: afundou ? 'afundou' : 'acerto', navio: id };
  }

  afundados() {
    return FROTA.map((n) => n.id).filter((id) => {
      const navio = this.navios.get(id);
      return navio !== undefined && navio.acertos === navio.casas.length;
    });
  }

  frotaAfundada() {
    return this.frotaCompleta() && this.afundados().length === FROTA.length;
  }

  // Desenha o oceano: '~' sem disparo, 'o' água atingida, 'X' navio atingido
  // e, se `mostrarNavios`, 'N' para navio ainda não atingido.
  desenhar({ mostrarNavios = false } = {}) {
    return this.casas.map((linha, l) => linha.map((id, c) => {
      if (this.tiros[l][c]) return id === null ? 'o' : 'X';
      return id !== null && mostrarNavios ? 'N' : '~';
    }).join(''));
  }

  #emJogo() {
    return this.tiros.some((linha) => linha.includes(true));
  }
}

class Partida {
  constructor(oceanoJogador1, oceanoJogador2) {
    if (!oceanoJogador1.frotaCompleta() || !oceanoJogador2.frotaCompleta()) {
      throw new Error('Os dois jogadores precisam alocar a frota completa');
    }
    this.oceanos = { 1: oceanoJogador1, 2: oceanoJogador2 };
    this.vez = 1;
    this.vencedor = null;
    this.historico = [];
  }

  // O jogador da vez dispara no oceano do adversário.
  // Errou (água): a vez passa. Acertou: joga de novo.
  disparar(coordenada) {
    if (this.vencedor !== null) throw new Error('A partida já terminou');
    const jogador = this.vez;
    const adversario = jogador === 1 ? 2 : 1;
    const tiro = this.oceanos[adversario].disparar(coordenada);
    this.historico.push({ jogador, coordenada: coordenada.toUpperCase(), ...tiro });

    if (this.oceanos[adversario].frotaAfundada()) {
      this.vencedor = jogador;
    } else if (tiro.resultado === 'agua') {
      this.vez = adversario;
    }
    return tiro;
  }
}

function vizinhas(l, c) {
  const lista = [];
  for (let dl = -1; dl <= 1; dl++) {
    for (let dc = -1; dc <= 1; dc++) {
      const vl = l + dl;
      const vc = c + dc;
      if ((dl || dc) && vl >= 0 && vl < TAMANHO && vc >= 0 && vc < TAMANHO) lista.push([vl, vc]);
    }
  }
  return lista;
}

module.exports = { Oceano, Partida, FROTA, TAMANHO, lerCoordenada, escreverCoordenada };

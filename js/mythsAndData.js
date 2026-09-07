/**
 * URCAFin - Módulo D: Painel de Mitos vs. Realidades Macroeconômicas
 * Comparativo Juros vs Bets e Simulador Interativo do Desenrola Brasil (2026)
 */

class MythsAndDataManager {
  constructor(data = URCA_DATA) {
    this.data = data;
  }

  /**
   * Retorna os dados para o gráfico macroeconômico comparativo
   */
  obterDadosGraficoMacro() {
    const comp = this.data.comparativoMacro;
    return {
      labels: comp.itens.map(i => i.categoria),
      valores: comp.itens.map(i => i.valorBilhoes),
      cores: comp.itens.map(i => i.cor),
      razao: comp.razaoProporcional,
      conclusao: comp.conclusaoDidatica,
      itens: comp.itens
    };
  }

  /**
   * Simula a renegociação pelo Desenrola Brasil (2026) comparada à rolagem no rotativo
   * @param {number} dividaOriginal - Saldo da dívida original negativada (R$)
   * @param {number} percentualDesconto - % de desconto no principal (0 a 90%)
   * @param {number} prazoMeses - Prazo de financiamento (12 a 60 meses)
   * @param {number} usoFgts - Valor de saldo do FGTS abatido à vista (R$)
   */
  simularDesenrola(dividaOriginal, percentualDesconto = 80, prazoMeses = 36, usoFgts = 0) {
    const orig = Math.max(0, Number(dividaOriginal) || 0);
    const descPct = Math.min(90, Math.max(0, Number(percentualDesconto) || 80));
    const n = Math.min(60, Math.max(1, Number(prazoMeses) || 36));
    const fgts = Math.min(orig, Math.max(0, Number(usoFgts) || 0));

    // Dívida com desconto do Desenrola
    const valorComDesconto = orig * (1 - descPct / 100);
    // Abate FGTS do principal remanescente
    const saldoAFinanciar = Math.max(0, valorComDesconto - fgts);

    // Taxa máxima de juros do Desenrola: 1,99% ao mês
    const iDesenrola = this.data.desenrolaBrasil.tetoJurosMensal / 100;

    // Cálculo da prestação pela Tabela Price
    let parcelaDesenrola = 0;
    if (saldoAFinanciar > 0) {
      if (iDesenrola === 0) {
        parcelaDesenrola = saldoAFinanciar / n;
      } else {
        parcelaDesenrola = saldoAFinanciar * (iDesenrola * Math.pow(1 + iDesenrola, n)) / (Math.pow(1 + iDesenrola, n) - 1);
      }
    }

    const totalPagoDesenrola = (parcelaDesenrola * n) + fgts;

    // Cenário alternativo se a dívida original ficasse rolando no rotativo por 1 ano
    const taxaRotativoMensal = this.data.macro.taxasCredito.rotativo.taxaMensal / 100;
    const dividaRotativo1Ano = orig * Math.pow(1 + taxaRotativoMensal, 12);
    const jurosRotativo1Ano = dividaRotativo1Ano - orig;

    // Economia total obtida com o Desenrola
    const economiaAbsoluta = Math.max(0, dividaRotativo1Ano - totalPagoDesenrola);
    const economiaPercentual = dividaRotativo1Ano > 0 ? (economiaAbsoluta / dividaRotativo1Ano) * 100 : 0;

    return {
      dividaOriginal: orig,
      percentualDesconto: descPct,
      valorComDesconto: Math.round(valorComDesconto * 100) / 100,
      usoFgts: fgts,
      saldoAFinanciar: Math.round(saldoAFinanciar * 100) / 100,
      prazoMeses: n,
      taxaJurosMensal: this.data.desenrolaBrasil.tetoJurosMensal,
      parcelaDesenrola: Math.round(parcelaDesenrola * 100) / 100,
      totalPagoDesenrola: Math.round(totalPagoDesenrola * 100) / 100,
      dividaRotativo1Ano: Math.round(dividaRotativo1Ano * 100) / 100,
      jurosRotativo1Ano: Math.round(jurosRotativo1Ano * 100) / 100,
      economiaAbsoluta: Math.round(economiaAbsoluta * 100) / 100,
      economiaPercentual: Math.round(economiaPercentual * 10) / 10,
      bloqueioBetsMeses: this.data.desenrolaBrasil.bloqueioBetsMeses
    };
  }
}

if (typeof window !== 'undefined') {
  window.MythsAndDataManager = MythsAndDataManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MythsAndDataManager;
}

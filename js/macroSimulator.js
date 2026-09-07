/**
 * URCAFin - Módulo A: Painel Macroeconômico e o "Efeito Bola de Neve"
 * Modelagem de Juros Compostos e Impacto Econométrico no Consumo
 */

class MacroSimulator {
  constructor(data = URCA_DATA) {
    this.data = data;
  }

  /**
   * Converte taxa anual nominal para taxa mensal efetiva equivalente
   * (1 + i_a) = (1 + i_m)^12  =>  i_m = (1 + i_a)^(1/12) - 1
   */
  anualParaMensal(taxaAnualPercentual) {
    const iAnual = taxaAnualPercentual / 100;
    const iMensal = Math.pow(1 + iAnual, 1 / 12) - 1;
    return iMensal * 100;
  }

  /**
   * Calcula o tempo teórico (em meses) para a dívida dobrar de valor
   * T_dobro = ln(2) / ln(1 + i)
   */
  calcularTempoDobroMeses(taxaMensalPercentual) {
    if (taxaMensalPercentual <= 0) return Infinity;
    const i = taxaMensalPercentual / 100;
    return Math.log(2) / Math.log(1 + i);
  }

  /**
   * Simula a evolução do saldo devedor mês a mês com ou sem pagamentos parciais
   * @param {number} valorInicial - Saldo inicial da dívida (R$)
   * @param {number} taxaMensal - Taxa de juros mensal (%)
   * @param {number} meses - Prazo da simulação em meses (1 a 36)
   * @param {number} pagamentoMensal - Pagamento/amortização efetuado por mês (R$)
   */
  simularLinha(valorInicial, taxaMensal, meses = 12, pagamentoMensal = 0) {
    const taxa = taxaMensal / 100;
    const serie = [];
    let saldoAtual = valorInicial;
    let jurosTotaisAcumulados = 0;
    let pagamentosTotaisAcumulados = 0;

    serie.push({
      mes: 0,
      saldo: saldoAtual,
      jurosMes: 0,
      pagamentoMes: 0,
      jurosAcumulados: 0
    });

    for (let m = 1; m <= meses; m++) {
      if (saldoAtual <= 0) {
        serie.push({
          mes: m,
          saldo: 0,
          jurosMes: 0,
          pagamentoMes: 0,
          jurosAcumulados: jurosTotaisAcumulados
        });
        continue;
      }

      const jurosDoMes = saldoAtual * taxa;
      jurosTotaisAcumulados += jurosDoMes;

      const pagamentoEfetivo = Math.min(pagamentoMensal, saldoAtual + jurosDoMes);
      pagamentosTotaisAcumulados += pagamentoEfetivo;

      saldoAtual = saldoAtual + jurosDoMes - pagamentoEfetivo;
      if (saldoAtual < 0.01) saldoAtual = 0;

      serie.push({
        mes: m,
        saldo: Math.round(saldoAtual * 100) / 100,
        jurosMes: Math.round(jurosDoMes * 100) / 100,
        pagamentoMes: Math.round(pagamentoEfetivo * 100) / 100,
        jurosAcumulados: Math.round(jurosTotaisAcumulados * 100) / 100
      });
    }

    const saldoFinal = serie[serie.length - 1].saldo;
    const tempoDobro = this.calcularTempoDobroMeses(taxaMensal);
    const multiplicador = valorInicial > 0 ? (saldoFinal + pagamentosTotaisAcumulados) / valorInicial : 0;

    return {
      valorInicial,
      taxaMensal,
      meses,
      pagamentoMensal,
      saldoFinal,
      jurosTotaisAcumulados: Math.round(jurosTotaisAcumulados * 100) / 100,
      pagamentosTotaisAcumulados: Math.round(pagamentosTotaisAcumulados * 100) / 100,
      tempoDobroMeses: Math.round(tempoDobro * 10) / 10,
      multiplicador: Math.round(multiplicador * 100) / 100,
      serie
    };
  }

  /**
   * Compara simultaneamente as 3 modalidades padrão do PRD + Cenário Customizado
   */
  simularComparativo(valorInicial, meses = 12, pagamentoMensal = 0, taxaCustomMensal = 5.0) {
    const rotativo = this.simularLinha(
      valorInicial,
      this.data.macro.taxasCredito.rotativo.taxaMensal,
      meses,
      pagamentoMensal
    );

    const chequeEspecial = this.simularLinha(
      valorInicial,
      this.data.macro.taxasCredito.chequeEspecial.taxaMensal,
      meses,
      pagamentoMensal
    );

    const consignado = this.simularLinha(
      valorInicial,
      this.data.macro.taxasCredito.consignado.taxaMensal,
      meses,
      pagamentoMensal
    );

    const customizado = this.simularLinha(
      valorInicial,
      taxaCustomMensal,
      meses,
      pagamentoMensal
    );

    return {
      rotativo,
      chequeEspecial,
      consignado,
      customizado
    };
  }

  /**
   * Calculadora de Impacto no Consumo (Modelo Econométrico de Crowding-out)
   * Demonstra a elasticidade-consumo da família a partir da razão dívida-renda
   * @param {number} rendaMensal - Renda líquida mensal familiar (R$)
   * @param {number} servicoDividaMensal - Parcela ou custo financeiro mensal pago em dívidas (R$)
   * @param {number} dividaTotal - Saldo devedor consolidado da família (R$)
   */
  calcularImpactoConsumo(rendaMensal, servicoDividaMensal, dividaTotal) {
    const rendaAnual = rendaMensal * 12;
    // DTI (Debt-to-Income): Razão Dívida / Renda Anual
    const dtiAnual = rendaAnual > 0 ? dividaTotal / rendaAnual : 0;
    // DSR (Debt Service Ratio): Comprometimento da renda mensal
    const dsr = rendaMensal > 0 ? (servicoDividaMensal / rendaMensal) * 100 : 0;

    // Propensão Marginal a Consumir estimada (PMC = 0.82)
    const pmc = 0.82;

    // Efeito Crowding-out (deslocamento direto de consumo das famílias)
    // Cada R$ 1 pago em serviço da dívida reduz o consumo em pmc * R$ 1
    const consumoPerdidoMensal = servicoDividaMensal * pmc;
    const consumoPerdidoAnual = consumoPerdidoMensal * 12;

    // Decomposição setorial do consumo sacrificado
    const reducaoAlimentacao = consumoPerdidoMensal * 0.28; // 28% sacrificado em alimentos
    const reducaoCapitalHumano = consumoPerdidoMensal * 0.42; // 42% sacrificado em educação, capacitação, saúde
    const reducaoBensDuraveisLazer = consumoPerdidoMensal * 0.30; // 30% sacrificado em vestuário, lazer e utilidades

    // Elasticidade-consumo estimada: % variação no consumo para cada 10% de aumento no DTI
    // Modelo empírico calibrado para o padrão de crédito brasileiro:
    // \epsilon_{C, DTI} = - (0.25 + 0.008 * DSR)
    const elasticidadeConsumoDti = -(0.25 + (0.008 * dsr));

    // Diagnóstico Econométrico
    let nivelVulnerabilidade = "Moderado";
    let recomendacaoAcademica = "";

    if (dsr <= 20) {
      nivelVulnerabilidade = "Sustentável (Margem Saudável)";
      recomendacaoAcademica = "O impacto sobre o consumo básico é amortecido. A renda permanente cobre o serviço da dívida sem comprometer a formação de capital humano da família.";
    } else if (dsr <= 35) {
      nivelVulnerabilidade = "Alerta de Asfixia Orçamentária";
      recomendacaoAcademica = "Efeito Crowding-out ativo: gastos essenciais começam a ser substituídos pelo pagamento de juros. A elasticidade-consumo torna o orçamento hiper-sensível a choques de inflação.";
    } else if (dsr <= 50) {
      nivelVulnerabilidade = "Severa Supressão de Consumo";
      recomendacaoAcademica = "Deslocamento crítico de consumo de capital humano (educação/saúde). O agente passa a viver sob restrição de liquidez severa, típica do modelo de endividamento forçado.";
    } else {
      nivelVulnerabilidade = "Colapso do Consumo e Superendividamento";
      recomendacaoAcademica = "Ruptura da restrição orçamentária intertemporal. Mais de 50% da renda destina-se a juros, tornando impossível manter o patamar mínimo civilizatório sem recorrer à Lei 14.181/2021.";
    }

    return {
      rendaMensal,
      servicoDividaMensal,
      dividaTotal,
      dtiAnual: Math.round(dtiAnual * 100) / 100,
      dsrPercentual: Math.round(dsr * 10) / 10,
      consumoPerdidoMensal: Math.round(consumoPerdidoMensal * 100) / 100,
      consumoPerdidoAnual: Math.round(consumoPerdidoAnual * 100) / 100,
      decomposicao: {
        alimentacao: Math.round(reducaoAlimentacao * 100) / 100,
        capitalHumano: Math.round(reducaoCapitalHumano * 100) / 100,
        duraveisLazer: Math.round(reducaoBensDuraveisLazer * 100) / 100
      },
      elasticidadeConsumoDti: Math.round(elasticidadeConsumoDti * 100) / 100,
      nivelVulnerabilidade,
      recomendacaoAcademica
    };
  }
}

if (typeof window !== 'undefined') {
  window.MacroSimulator = MacroSimulator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MacroSimulator;
}

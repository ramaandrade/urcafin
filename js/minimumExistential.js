/**
 * URCAFin - Módulo C: Calculadora do Mínimo Existencial (Lei 14.181/2021)
 * Simulação da Recuperação Judicial da Pessoa Física e Repactuação Quinquenal
 */

class MinimumExistentialCalculator {
  constructor(data = URCA_DATA) {
    this.data = data;
    this.pisoDecreto = data.macro.indicadoresSociais.minimoExistencialDecreto; // R$ 600,00
  }

  /**
   * Calcula a partição orçamentária entre despesas vitais e capacidade de repactuação
   * @param {Object} dados - Parâmetros financeiros da família
   */
  calcularPlano(dados) {
    const rendaLiquida = Math.max(0, Number(dados.rendaLiquida) || 0);
    const alimentacao = Math.max(0, Number(dados.alimentacao) || 0);
    const aguaLuz = Math.max(0, Number(dados.aguaLuz) || 0);
    const moradia = Math.max(0, Number(dados.moradia) || 0);
    const saude = Math.max(0, Number(dados.saude) || 0);
    const transporte = Math.max(0, Number(dados.transporte) || 0);
    const outrosEssenciais = Math.max(0, Number(dados.outrosEssenciais) || 0);
    const dividaTotal = Math.max(0, Number(dados.dividaTotal) || 0);
    const prazoMeses = Math.min(60, Math.max(12, Number(dados.prazoMeses) || 60)); // até 5 anos

    // Total de despesas essenciais comprovadas
    const despesasEssenciaisReais = alimentacao + aguaLuz + moradia + saude + transporte + outrosEssenciais;

    // O Mínimo Existencial efetivo: a dignidade humana protege o custo de vida real essencial,
    // tendo o valor infralegal de R$ 600,00 como piso mínimo absoluto de segurança alimentar.
    const minimoExistencialEfetivo = Math.max(this.pisoDecreto, despesasEssenciaisReais);

    // Margem orçamentária livre disponível para os credores após garantir a subsistência
    const margemLivreReal = Math.max(0, rendaLiquida - despesasEssenciaisReais);

    // Teto prudencial consignável recomendado por lei (30% da renda líquida)
    const tetoPrudencial30 = rendaLiquida * 0.30;
    const tetoPrudencial35 = rendaLiquida * 0.35; // margem com benefício consignado

    // Capacidade efetiva de pagamento prudencial (não pode violar nem a subsistência nem o teto prudencial)
    const capacidadeEfetivaMensal = Math.min(margemLivreReal, tetoPrudencial30);

    // Valor da parcela linear em prazo de repactuação (expurgo de juros moratórios da Lei 14.181/2021)
    const parcelaNecessaria = prazoMeses > 0 ? dividaTotal / prazoMeses : 0;

    // Percentual da renda que a parcela exigiria
    const percentualRendaParcela = rendaLiquida > 0 ? (parcelaNecessaria / rendaLiquida) * 100 : 0;

    // Montante máximo que o devedor consegue pagar no prazo sem passar fome nem estourar os limites
    const totalMaximoViavelNoPrazo = capacidadeEfetivaMensal * prazoMeses;

    // Déficit ou Superávit da repactuação
    const saldoResidualNaoCoberto = Math.max(0, dividaTotal - totalMaximoViavelNoPrazo);
    const haircutNecessarioPercentual = dividaTotal > 0 ? (saldoResidualNaoCoberto / dividaTotal) * 100 : 0;

    // Diagnóstico Jurídico-Econômico e Alerta de Solvência
    let statusRepactuacao = "";
    let classeAlerta = "";
    let descricaoDiagnostico = "";
    let recomendacaoJudicial = "";

    if (rendaLiquida <= despesasEssenciaisReais) {
      statusRepactuacao = "Insolvência Total / Déficit de Subsistência";
      classeAlerta = "bg-red-500 text-white";
      descricaoDiagnostico = "A renda familiar líquida não é suficiente sequer para cobrir os itens básicos de sobrevivência (alimentação, energia, água, moradia e saúde). A margem para repactuação é nula (R$ 0,00).";
      recomendacaoJudicial = "Aplicação imediata do Art. 104-B da Lei 14.181/2021: suspensão total de execuções, carência compulsória de 180 dias, corte substancial de juros futuros e intervenção de órgãos de assistência social municipal.";
    } else if (parcelaNecessaria <= capacidadeEfetivaMensal) {
      statusRepactuacao = "Repactuação Plenamente Viável (Solvente em 5 Anos)";
      classeAlerta = "bg-emerald-600 text-white";
      descricaoDiagnostico = `A família possui margem líquida suficiente (R$ ${capacidadeEfetivaMensal.toFixed(2)}) para liquidar 100% do principal de R$ ${dividaTotal.toFixed(2)} em ${prazoMeses} parcelas de R$ ${parcelaNecessaria.toFixed(2)}, preservando integralmente o Mínimo Existencial de R$ ${despesasEssenciaisReais.toFixed(2)}.`;
      recomendacaoJudicial = "Apresentação de Plano Voluntário de Pagamento no Procon ou CEJUSC/TJCE. Suspensão de juros moratórios e expedição de certidões positivas com efeito de negativas.";
    } else if (parcelaNecessaria <= margemLivreReal && parcelaNecessaria > tetoPrudencial30) {
      statusRepactuacao = "Alerta Prudencial: Asfixia Orçamentária Excedente";
      classeAlerta = "bg-amber-500 text-white";
      descricaoDiagnostico = `A parcela de R$ ${parcelaNecessaria.toFixed(2)} consome ${percentualRendaParcela.toFixed(1)}% da renda familiar, ultrapassando o teto prudencial de 30%. Embora não invada formalmente a alimentação básica, deixa o devedor sem nenhuma margem para imprevistos.`;
      recomendacaoJudicial = "Revisão do plano conciliatório: propor dilatação do prazo para 60 meses ou requerer abatimento de encargos contratuais de modo que a parcela não ultrapasse 30% da renda.";
    } else {
      statusRepactuacao = "Superendividamento Crítico: Necessidade de Haircut (Desconto Compulsório)";
      classeAlerta = "bg-red-600 text-white";
      descricaoDiagnostico = `A família é incapaz de pagar o montante integral de R$ ${dividaTotal.toFixed(2)} no prazo legal mantendo o Mínimo Existencial. O devedor consegue aportar no máximo R$ ${capacidadeEfetivaMensal.toFixed(2)}/mês (totalizando R$ ${totalMaximoViavelNoPrazo.toFixed(2)} em ${prazoMeses} meses), restando um saldo insolúvel de R$ ${saldoResidualNaoCoberto.toFixed(2)}.`;
      recomendacaoJudicial = `Instauração do Processo por Superendividamento Judicial Compulsório. O juiz deverá homologar plano judicial aplicando um 'haircut' (desconto forçado) de no mínimo ${haircutNecessarioPercentual.toFixed(1)}% sobre as instituições financeiras intransigentes.`;
    }

    return {
      rendaLiquida,
      despesas: {
        alimentacao,
        aguaLuz,
        moradia,
        saude,
        transporte,
        outrosEssenciais,
        total: despesasEssenciaisReais
      },
      dividaTotal,
      prazoMeses,
      pisoLegalDecreto: this.pisoDecreto,
      minimoExistencialEfetivo,
      margemLivreReal,
      tetoPrudencial30,
      tetoPrudencial35,
      capacidadeEfetivaMensal,
      parcelaNecessaria,
      percentualRendaParcela: Math.round(percentualRendaParcela * 10) / 10,
      totalMaximoViavelNoPrazo,
      saldoResidualNaoCoberto,
      haircutNecessarioPercentual: Math.round(haircutNecessarioPercentual * 10) / 10,
      statusRepactuacao,
      classeAlerta,
      descricaoDiagnostico,
      recomendacaoJudicial
    };
  }
}

if (typeof window !== 'undefined') {
  window.MinimumExistentialCalculator = MinimumExistentialCalculator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinimumExistentialCalculator;
}

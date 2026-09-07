/**
 * URCAFin - Módulo B: Motor de Diagnóstico Teórico de Endividamento
 * Conecta comportamentos empíricos a teorias acadêmicas de economia e finanças
 */

class DiagnosticEngine {
  constructor(data = URCA_DATA) {
    this.data = data;
    this.questoes = data.questoesDiagnostico;
  }

  /**
   * Avalia as respostas do questionário
   * @param {Object} respostas - Mapeamento { [questaoId]: indiceOpcao }
   */
  avaliar(respostas) {
    let pontuacaoBruta = 0;
    const maxPontos = this.questoes.length * 4; // 10 * 4 = 40 pontos
    const analisesDetalhadas = [];
    const vulnerabilidadesCriticas = [];

    this.questoes.forEach(q => {
      const opcaoIndex = respostas[q.id];
      if (opcaoIndex !== undefined && q.opcoes[opcaoIndex]) {
        const opcao = q.opcoes[opcaoIndex];
        pontuacaoBruta += opcao.pontos;

        const analiseItem = {
          questaoId: q.id,
          titulo: q.titulo,
          teoria: q.teoria,
          conceitoChave: q.conceitoChave,
          respostaEscolhida: opcao.texto,
          pontos: opcao.pontos,
          risco: opcao.risco,
          analiseTeorica: opcao.analise,
          recomendacaoAcademica: this.obterRecomendacaoTeorica(q.id, opcao.pontos)
        };

        analisesDetalhadas.push(analiseItem);

        // Identifica pontos de alerta vermelho (risco alto ou crítico)
        if (opcao.risco === 'critico' || opcao.risco === 'alto') {
          vulnerabilidadesCriticas.push({
            id: q.id,
            tema: q.titulo.replace(/^\d+\.\s*/, ''),
            teoria: q.teoria,
            gravidade: opcao.risco
          });
        }
      }
    });

    // Normaliza para escala 0 a 100
    const indiceVulnerabilidade = Math.round((pontuacaoBruta / maxPontos) * 100);

    // Classificação Teórica de Perfil
    const perfil = this.classificarPerfil(indiceVulnerabilidade);

    return {
      pontuacaoBruta,
      maxPontos,
      indiceVulnerabilidade, // 0 (imune) a 100 (superendividamento total)
      perfil,
      vulnerabilidadesCriticas,
      analisesDetalhadas,
      questoesRespondidas: Object.keys(respostas).length,
      totalQuestoes: this.questoes.length
    };
  }

  /**
   * Classifica a posição de solvência e risco
   */
  classificarPerfil(indice) {
    if (indice <= 25) {
      return {
        nivel: "Baixo",
        status: "Solvência Estrutural e Equilíbrio Orçamentário",
        cor: "#10B981", // Verde
        bgCor: "bg-emerald-50 text-emerald-800 border-emerald-300",
        resumo: "Comportamento com forte consistência temporal intertemporal, alinhado à Teoria do Ciclo de Vida sem déficit primário.",
        diagnosticoEpistemologico: "O agente demonstra aderência aos postulados de expectativas racionais e preferência temporal equilibrada. O orçamento não apresenta contágio por ilusões monetárias e possui colchão de liquidez para choques exógenos.",
        diretrizDidatica: "Aprofundar a otimização de carteiras (Markowitz), diversificação em ativos reais e indexados ao IPCA, e blindagem patrimonial."
      };
    } else if (indice <= 50) {
      return {
        nivel: "Moderado",
        status: "Vulnerabilidade Intermediária e Riscos Comportamentais",
        cor: "#F59E0B", // Âmbar
        bgCor: "bg-amber-50 text-amber-800 border-amber-300",
        resumo: "Padrão de consumo suscetível a choques de juros e vieses heurísticos de curto prazo.",
        diagnosticoEpistemologico: "Presença de viés do presente (Laibson) e contabilidade mental imperfeita. Há dependência residual de crédito rotativo ou vulnerabilidade a imprevistos decorrente de reserva precaucional insuficiente.",
        diretrizDidatica: "Instituir 'nudges' comportamentais (Thaler), teto rígido de 30% da renda para parcelas e priorização do pagamento antecipado do principal."
      };
    } else if (indice <= 75) {
      return {
        nivel: "Alto",
        status: "Fragilidade Financeira e Risco de Inadimplência",
        cor: "#F97316", // Laranja
        bgCor: "bg-orange-50 text-orange-800 border-orange-300",
        resumo: "Estrutura financeira na modalidade 'Especulativa' de Minsky: renda mal cobre juros correntes.",
        diagnosticoEpistemologico: "Efeito bola de neve já deflagrado. A racionalidade limitada impede a mensuração real do CET, gerando substituição perversa de consumo básico por rolagem de passivos bancários.",
        diretrizDidatica: "Portabilidade compulsória de dívidas (arbitragem de spread), suspensão de linhas rotativas e auditoria de contratos bancários abusivos."
      };
    } else {
      return {
        nivel: "Crítico",
        status: "Superendividamento Crítico e Asfixia Jurídica",
        cor: "#EF4444", // Vermelho
        bgCor: "bg-red-50 text-red-800 border-red-300",
        resumo: "Ruptura da capacidade civil de pagamento. Caso típico de enquadramento na Lei 14.181/2021.",
        diagnosticoEpistemologico: "Estrutura 'Ponzi' consolidada. A espiral de juros compostos superou a renda vitalícia. Há comprometimento do mínimo existencial e sobrecarga cognitiva severa (Mullainathan & Shafir).",
        diretrizDidatica: "Encaminhamento imediato para Recuperação Judicial da Pessoa Física (Núcleo de Prática Jurídica / Procon / Defensoria Pública) para repactuação compulsória em 5 anos com base no mínimo existencial."
      };
    }
  }

  /**
   * Recomendações pedagógicas caso a caso
   */
  obterRecomendacaoTeorica(questaoId, pontos) {
    const mapaRecomendacoes = {
      1: {
        baixo: "Manter o balanço orçamentário e aplicar excedentes em ativos líquidos remunerados pela taxa Selic.",
        alto: "Reestruturação do padrão de consumo: separar despesas estruturais de supérfluas e eliminar imediatamente a dependência de cartão para compras de supermercado."
      },
      2: {
        baixo: "A margem de endividamento está confortável, preservando a capacidade de investimento.",
        alto: "Aplicar a 'Regra dos 30%': congelar novas compras parceladas até que o comprometimento da renda caia para menos de 20% da folha líquida."
      },
      3: {
        baixo: "Disciplina temporal exemplar. Continue desativando limites automáticos de cheque especial para evitar cobranças acidentais.",
        alto: "Urgência máxima: o juro rotativo a 14,9% a.m. dobra o débito em menos de 5 meses. Buscar crédito consignado ou empréstimo pessoal com garantia para liquidar o rotativo no primeiro dia útil."
      },
      4: {
        baixo: "Excelente postura informacional. Recomenda-se o uso regular da calculadora do Cidadão do Banco Central para comparar CETs de propostas concorrentes.",
        alto: "Combate à Racionalidade Limitada: nunca assinar contrato financeiro com foco no valor da parcela. Exigir do credor a Planilha de CET discriminando IOF, taxa de cadastro e seguros embutidos (venda casada)."
      },
      5: {
        baixo: "Maturidade de inteligência emocional-financeira: compras deliberadas e planejadas.",
        alto: "Implementação de barreiras de atrito deliberado (cooling-off rule): regra de esperar 48 horas antes de concluir compras acima de R$ 100 e desvincular cartões de crédito salvos em aplicativos de compras."
      },
      6: {
        baixo: "Equilíbrio psicológico preservado. O bem-estar financeiro sustenta o rendimento acadêmico e profissional.",
        alto: "Alívio da sobrecarga cognitiva: a ansiedade por dívidas diminui a capacidade de raciocínio lógico. Mapear todas as dívidas no papel em ordem de taxa de juros para recuperar o controle cognitivo."
      },
      7: {
        baixo: "Política de passivo limpo. Dívidas não devem gerar novas dívidas.",
        alto: "Estancar imediatamente a rolagem de passivos: novo empréstimo só é admissível se a taxa de juros for comprovadamente no mínimo 50% menor e com liquidação total do contrato original (portabilidade de crédito)."
      },
      8: {
        baixo: "Pontualidade contratual impecável. Manutenção de score de crédito favorável para negociações futuras.",
        alto: "Diferenciação didática Peic: se as contas já estão em atraso há mais de 30 dias, interromper pagamentos parciais e aguardar feirões de renegociação (Desenrola / Serasa Limpa Nome) com descontos de até 90% sobre encargos moratórios."
      },
      9: {
        baixo: "Firmeza identitária orçamentária: consumo pautado por utilidade real e não por validação social.",
        alto: "Desconstrução do Efeito Demonstração de Veblen: reconhecer que bens materiais financiados não geram status real, mas sim servidão financeira de longo prazo. Reduzir exposição a gatilhos em redes sociais."
      },
      10: {
        baixo: "Segurança de liquidez exemplar. Manter a reserva aplicada em Tesouro Selic ou CDBs com liquidez diária a 100% do CDI.",
        alto: "Prioridade estratégica número 1 pós-estabilização: constituir imediatamente uma reserva emergencial inicial de pelo menos 1 salário mínimo para evitar que o próximo imprevisto devolva o indivíduo ao cheque especial."
      }
    };

    const config = mapaRecomendacoes[questaoId];
    if (!config) return "Avaliar periodicamente os parâmetros orçamentários.";
    return pontos >= 3 ? config.alto : config.baixo;
  }
}

if (typeof window !== 'undefined') {
  window.DiagnosticEngine = DiagnosticEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagnosticEngine;
}

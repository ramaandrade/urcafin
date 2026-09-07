/**
 * URCAFin - Banco de Dados Didático e Matriz Teórica
 * Curso de Ciências Econômicas - Universidade Regional do Cariri (URCA)
 */

const URCA_DATA = {
  // Parâmetros Macroeconômicos Atuais do Brasil (2026/Cenário de Referência)
  macro: {
    selicAnual: 14.50, // % a.a.
    selicMensal: 1.13, // % a.m. equivalente
    inflacaoIPCA: 4.10, // % a.a.
    taxasCredito: {
      rotativo: {
        nome: "Cartão de Crédito Rotativo",
        taxaAnual: 440.5, // % a.a.
        taxaMensal: 14.92, // % a.m.
        descricao: "Modalidade de crédito mais onerosa do mercado brasileiro. Aplicada quando não se paga a fatura integral.",
        cor: "#EF4444" // Vermelho crítico
      },
      chequeEspecial: {
        nome: "Cheque Especial",
        taxaAnual: 130.0, // % a.a.
        taxaMensal: 7.18, // % a.m.
        descricao: "Limite emergencial automático da conta corrente com taxa regulada e juros compostos diários.",
        cor: "#F59E0B" // Âmbar alerta
      },
      consignado: {
        nome: "Crédito Consignado (INSS / Servidores)",
        taxaAnual: 24.8, // % a.a.
        taxaMensal: 1.87, // % a.m.
        descricao: "Linha de crédito com desconto em folha e garantia de recebimento, com risco de inadimplência muito menor.",
        cor: "#10B981" // Verde prudencial
      },
      pessoalNaoConsignado: {
        nome: "Crédito Pessoal Tradicional",
        taxaAnual: 88.5, // % a.a.
        taxaMensal: 5.41, // % a.m.
        descricao: "Empréstimo direto sem garantia real concedido por bancos e financeiras.",
        cor: "#6366F1" // Indigo
      }
    },
    indicadoresSociais: {
      familiasEndividadas: 80.9, // % das famílias (CNC / Peic)
      familiasInadimplentes: 29.6, // % das famílias com contas em atraso
      familiasSemCondicoes: 12.8, // % que declaram não ter condições de pagar
      jurosPagosFamiliasTotal: 696.8, // R$ bilhões/ano pagos em juros
      gastosApostasBetsTotal: 37.0, // R$ bilhões/ano em apostas online
      percentualConsumoBets: 0.46, // % do consumo total das famílias
      minimoExistencialDecreto: 600.00 // R$ valor infralegal Decreto 11.567/2023
    }
  },

  // Questionário de Diagnóstico de Endividamento (10 Perguntas Teóricas)
  questoesDiagnostico: [
    {
      id: 1,
      titulo: "1. Uso de Crédito para Manutenção do Padrão de Vida",
      enunciado: "Com que frequência você ou sua família recorre a empréstimos, cartões de crédito ou ajuda financeira para cobrir despesas cotidianas regulares (supermercado, contas básicas, moradia)?",
      teoria: "Teoria do Ciclo de Vida (Franco Modigliani)",
      conceitoChave: "Suavização do Consumo vs. Ilusão de Renda Permanente",
      opcoes: [
        {
          texto: "Nunca: o padrão de vida é estritamente ajustado à renda líquida disponível.",
          pontos: 0,
          risco: "baixo",
          analise: "Comportamento em estrita consonância com a Teoria do Ciclo de Vida: a renda presente financia o consumo presente sem antecipar rendas incertas futuras."
        },
        {
          texto: "Raramente: apenas em situações imprevistas pontuais de choque de liquidez.",
          pontos: 1,
          risco: "baixo",
          analise: "Uso do crédito como mecanismo estrito de amortecimento temporário (smoothing), mantendo solvência estrutural."
        },
        {
          texto: "Frequentemente: todo final de mês é necessário complementar os gastos básicos com cartão ou cheque especial.",
          pontos: 3,
          risco: "alto",
          analise: "Falha na suavização intertemporal: o crédito passa a ser computado psicologicamente como 'renda', criando déficit estrutural contínuo."
        },
        {
          texto: "Sempre: o salário já entra comprometido para quitar o limite do mês anterior e novas dívidas são contraídas no mesmo dia.",
          pontos: 4,
          risco: "critico",
          analise: "Déficit crônico do ciclo de vida: quebra da restrição orçamentária intertemporal e início do superendividamento patológico."
        }
      ]
    },
    {
      id: 2,
      titulo: "2. Comprometimento da Renda Mensal com Dívidas",
      enunciado: "Qual percentual da renda líquida total familiar está atualmente destinado ao pagamento de parcelas de empréstimos, faturas e financiamentos?",
      teoria: "Indicadores de Solvência e Fragilidade Financeira (Hyman Minsky)",
      conceitoChave: "Finanças Hedge, Especulativas e Ponzi",
      opcoes: [
        {
          texto: "Até 10% da renda líquida familiar.",
          pontos: 0,
          risco: "baixo",
          analise: "Posição 'Hedge' de Minsky: o fluxo de caixa operacional cobre com ampla folga o serviço da dívida e o principal."
        },
        {
          texto: "Entre 11% e 30% da renda líquida (limite prudencial recomendado).",
          pontos: 1,
          risco: "baixo",
          analise: "Zona de segurança prudencial padrão. Margem suficiente para absorver flutuações e juros moderados."
        },
        {
          texto: "Entre 31% e 50% da renda líquida.",
          pontos: 3,
          risco: "alto",
          analise: "Alerta de Solvência: Posição 'Especulativa' de Minsky. O fluxo de renda cobre apenas juros e parte mínima do principal, tornando a família vulnerável a choques."
        },
        {
          texto: "Mais de 50% da renda mensal consumida por parcelas e juros.",
          pontos: 4,
          risco: "critico",
          analise: "Posição 'Ponzi' de Minsky: a renda não cobre sequer os juros correntes sem contrair novo endividamento. Superendividamento iminente."
        }
      ]
    },
    {
      id: 3,
      titulo: "3. Frequência de Uso do Rotativo e Cheque Especial",
      enunciado: "Como tem sido o pagamento da fatura do cartão de crédito e a utilização do cheque especial nos últimos 6 meses?",
      teoria: "Crédito Comportamental e Viés do Presente (David Laibson / George Akerlof)",
      conceitoChave: "Desconto Hiperbólico e Ilusão de Custo Zero Imediato",
      opcoes: [
        {
          texto: "Fatura sempre paga integralmente no vencimento e cheque especial desativado ou nunca usado.",
          pontos: 0,
          risco: "baixo",
          analise: "Consistência temporal de preferências: preferência pelo consumo presente subordinada ao custo financeiro futuro racional."
        },
        {
          texto: "Pagou o valor mínimo do cartão ou usou o cheque especial 1 vez por imprevisto grave, mas já regularizou.",
          pontos: 1,
          risco: "moderado",
          analise: "Episódio isolado com rápida autocorreção, evitando a armadilha do juro composto de 440% a.a."
        },
        {
          texto: "Uso recorrente (2 a 4 vezes) do pagamento mínimo ou permanência constante no limite da conta.",
          pontos: 3,
          risco: "alto",
          analise: "Desconto hiperbólico ativo: forte viés do presente onde o alívio imediato supera o custo catastrófico da taxa de 14,9% ao mês."
        },
        {
          texto: "Rolagem contínua: saldo no cheque especial há meses e faturas parceladas sucessivamente com juros rotativos.",
          pontos: 4,
          risco: "critico",
          analise: "Armadilha comportamental crônica: subestimação do crescimento geométrico da dívida, acelerando o efeito bola de neve."
        }
      ]
    },
    {
      id: 4,
      titulo: "4. Conhecimento e Análise do Custo Efetivo Total (CET)",
      enunciado: "Ao contratar um empréstimo, parcelar compras ou financiar um bem, você analisa o Custo Efetivo Total (CET) anual ou apenas o valor da parcela mensal?",
      teoria: "Teoria da Racionalidade Limitada (Herbert Simon)",
      conceitoChave: "Heurística de Acessibilidade e Ilusão de Parcela",
      opcoes: [
        {
          texto: "Calculo e comparo o CET anual entre diversas instituições, somando juros, IOF, seguros e tarifas administrativas.",
          pontos: 0,
          risco: "baixo",
          analise: "Racionalidade maximizadora e otimização informacional plena: o agente contorna as assimetrias e armadilhas contratuais."
        },
        {
          texto: "Sei a taxa de juros nominal anunciada, embora nem sempre confira detalhadamente o CET.",
          pontos: 1,
          risco: "baixo",
          analise: "Racionalidade satisfatória intermediária: compreensão do custo básico, mas com pontos cegos em custos acessórios."
        },
        {
          texto: "Foco quase que exclusivamente em saber 'se a parcela cabe no bolso no final do mês'.",
          pontos: 3,
          risco: "alto",
          analise: "Heurística de Parcela (Simon): sob sobrecarga cognitiva, o consumidor foca em uma única variável simplificadora, ignorando que pagará 3 a 5 vezes o valor do bem."
        },
        {
          texto: "Não sei o que é CET e nunca verifiquei as taxas de juros cobradas nos contratos que assinei.",
          pontos: 4,
          risco: "critico",
          analise: "Assimetria informacional máxima e opacidade contratual: vulnerabilidade jurídica total descrita no Código de Defesa do Consumidor."
        }
      ]
    },
    {
      id: 5,
      titulo: "5. Consumo Impulsivo por Fatores Emocionais (Estresse/Tristeza)",
      enunciado: "Em situações de ansiedade, estresse acadêmico/profissional ou frustração, com que frequência você realiza compras não planejadas para obter alívio emocional?",
      teoria: "Economia Comportamental & Contabilidade Mental (Richard Thaler / Daniel Kahneman)",
      conceitoChave: "Esgotamento do Ego, Vieses Heurísticos e Regulação Emocional por Compras",
      opcoes: [
        {
          texto: "Raramente ou nunca: todas as compras relevantes seguem planejamento orçamentário prévio.",
          pontos: 0,
          risco: "baixo",
          analise: "Sistema 2 (Kahneman) dominante: prevalência do pensamento reflexivo e controle inibitório sobre impulsos imediatistas de consumo."
        },
        {
          texto: "Ocasionalmente em pequenos valores que não afetam o orçamento mensal.",
          pontos: 1,
          risco: "baixo",
          analise: "Compensação emocional contida dentro de contas mentais delimitadas e seguras."
        },
        {
          texto: "Frequentemente utilizo o ato de comprar como principal mecanismo de recompensa ou desestresse.",
          pontos: 3,
          risco: "alto",
          analise: "Ativação do Sistema 1 (automático e emocional): substituição da regulação psicológica por consumo compensatório com crédito fácil."
        },
        {
          texto: "Compras impulsivas constantes seguidas de forte sentimento de culpa e faturas impagáveis.",
          pontos: 4,
          risco: "critico",
          analise: "Padrão de 'one-click shopping' patológico e miopia intertemporal severa: desorganização do bem-estar e da solvência."
        }
      ]
    },
    {
      id: 6,
      titulo: "6. Sobrecarga Cognitiva e Impactos no Bem-Estar Emocional",
      enunciado: "A preocupação com dívidas e falta de dinheiro afeta sua concentração nos estudos/trabalho, seu sono ou sua qualidade de vida?",
      teoria: "Psicologia Econômica & Teoria da Escassez (Sendhil Mullainathan & Eldar Shafir)",
      conceitoChave: "Tributo Cognitivo (Bandwidth Tax) e Estresse Financeiro",
      opcoes: [
        {
          texto: "Não afeta: as finanças estão sob controle e não geram ansiedade.",
          pontos: 0,
          risco: "baixo",
          analise: "Largura de banda mental preservada: capacidade analítica total disponível para tomada de decisões acadêmicas e de carreira."
        },
        {
          texto: "Causa preocupação leve e passageira apenas em épocas de despesas sazonais (início do ano/semestre).",
          pontos: 1,
          risco: "baixo",
          analise: "Estresse orçamentário transitório típico sem degradação contínua da capacidade de planejamento."
        },
        {
          texto: "Afeta o sono com frequência e sinto desânimo ou vergonha ao verificar o extrato bancário.",
          pontos: 3,
          risco: "alto",
          analise: "Instalação da Sobrecarga Cognitiva (Shafir): o estresse da escassez reduz temporariamente o QI funcional e induz decisões financeiras míopes."
        },
        {
          texto: "Preocupação constante e debilitante: crises de ansiedade, desespero e perda de foco total nas atividades vitais.",
          pontos: 4,
          risco: "critico",
          analise: "Esgotamento cognitivo agudo: ciclo vicioso onde o desespero emocional impede a negociação racional e agrava a insolvência."
        }
      ]
    },
    {
      id: 7,
      titulo: "7. Contratação de Empréstimos Sucessivos para Pagar Dívidas",
      enunciado: "Nos últimos 12 meses, você contratou novo empréstimo, adiantou 13º/restituição ou renegociou dívidas exclusivamente para quitar parcelas anteriores?",
      teoria: "Dinâmica do Efeito Bola de Neve & Ilusão de Liquidez",
      conceitoChave: "Rolagem de Dívida e Multiplicador Geométrico do Passivo",
      opcoes: [
        {
          texto: "Não: nunca paguei uma dívida contraindo outra nova.",
          pontos: 0,
          risco: "baixo",
          analise: "Inexistência do efeito bola de neve: passivos são amortizados exclusivamente através de poupança ou geração de superávit primário."
        },
        {
          texto: "Fiz portabilidade ou consolidação planejada de dívidas caras para uma linha com taxa substancialmente menor.",
          pontos: 0,
          risco: "baixo",
          analise: "Arbitragem racional de taxas (ex: trocar rotativo a 440% por consignado a 25%): manobra técnica prudente de desendividamento."
        },
        {
          texto: "Peguei empréstimo com juros similares ou maiores para cobrir faturas atrasadas e evitar nome sujo.",
          pontos: 3,
          risco: "alto",
          analise: "Rolagem improdutiva: substituição de credor sem redução de taxa, acelerando o montante do principal sobre juros compostos."
        },
        {
          texto: "Ciclo contínuo de 'apagar incêndio': vários empréstimos sobrepostos em bancos diferentes, financeiras ou familiares.",
          pontos: 4,
          risco: "critico",
          analise: "Espiral descendente do endividamento: o valor pago mensalmente é absorvido 100% pelos juros, enquanto o saldo devedor segue aumentando."
        }
      ]
    },
    {
      id: 8,
      titulo: "8. Atrasos de Contas e Restrições Cadastrais (Inadimplência)",
      enunciado: "Você possui contas básicas, parcelas ou faturas em atraso há mais de 30 dias, ou apontamentos em órgãos de proteção ao crédito (SPC/Serasa)?",
      teoria: "Economia do Consumidor: Endividamento vs. Inadimplência (Pesquisa Peic / CNC)",
      conceitoChave: "Transição do Endividamento Ativo para a Inadimplência Estrutural",
      opcoes: [
        {
          texto: "Nenhuma conta em atraso e sem qualquer restrição cadastral.",
          pontos: 0,
          risco: "baixo",
          analise: "Endividamento nulo ou perfeitamente adimplente: fluxo de pagamentos regular dentro do prazo contratual."
        },
        {
          texto: "Atrasos esporádicos de até 15 dias por esquecimento ou descasamento de datas de vencimento com a data de pagamento.",
          pontos: 1,
          risco: "baixo",
          analise: "Desalinhamento meramente operacional de fluxo de caixa, facilmente sanado com unificação de vencimentos."
        },
        {
          texto: "Possuo 1 ou 2 contas atrasadas há mais de 30 dias ou nome negativado recentemente.",
          pontos: 3,
          risco: "alto",
          analise: "Inadimplência Formal Estabelecida (conforme recorte Peic 29,6% das famílias brasileiras): perda de acesso a crédito saudável e corte de serviços."
        },
        {
          texto: "Múltiplas dívidas negativadas há meses/anos e sensação de incapacidade total de quitação.",
          pontos: 4,
          risco: "critico",
          analise: "Superendividamento com Exclusão Econômica: enquadramento pleno na Lei 14.181/2021 para instauração de processo de repactuação judicial."
        }
      ]
    },
    {
      id: 9,
      titulo: "9. Pressão Social, Padrão dos Pares e Status de Consumo",
      enunciado: "Ao tomar decisões de compra (roupas, saídas, eletrônicos, viagens), até que ponto você é influenciado pelo estilo de vida de colegas, amigos ou redes sociais?",
      teoria: "Teoria do Consumo Conspícuo & Comparação Social (Thorstein Veblen / Leon Festinger)",
      conceitoChave: "Efeito Demonstração e 'Keeping up with the Joneses'",
      opcoes: [
        {
          texto: "Zero influência: minhas escolhas de consumo são 100% balizadas pela minha renda real e metas financeiras.",
          pontos: 0,
          risco: "baixo",
          analise: "Autonomia orçamentária plena: imunidade psicológica ao Efeito Demonstração e ausência de consumo posicional forçado."
        },
        {
          texto: "Pequena influência em ocasiões sociais pontuais, mas sei impor limites claros sem constrangimento.",
          pontos: 1,
          risco: "baixo",
          analise: "Participação social saudável sem comprometer a estabilidade intertemporal da renda."
        },
        {
          texto: "Frequentemente me sinto pressionado(a) a frequentar lugares caros ou comprar itens da moda para não me sentir excluído(a).",
          pontos: 3,
          risco: "alto",
          analise: "Consumo Conspícuo de Veblen: busca de aprovação social por meio de bens posicionais, gerando descolamento entre renda e despesa."
        },
        {
          texto: "Mantenho um estilo de vida artificial baseado em aparências e crédito rotativo para manter um status fictício perante os outros.",
          pontos: 4,
          risco: "critico",
          analise: "Dissonância financeira aguda decorrente da Teoria da Comparação Social: destruição patrimonial em prol da validação externa passageira."
        }
      ]
    },
    {
      id: 10,
      titulo: "10. Reserva de Emergência e Gestão de Riscos",
      enunciado: "Se você ou sua família perdesse hoje toda a renda de uma hora para a outra, por quanto tempo suas economias guardadas conseguiriam pagar as contas básicas?",
      teoria: "Teoria Keynesiana da Demanda por Moeda & Gestão de Riscos",
      conceitoChave: "Motivo Precaução e Amortecedor de Liquidez",
      opcoes: [
        {
          texto: "Por 6 meses ou mais (reserva de emergência integral em aplicação de alta liquidez e baixo risco).",
          pontos: 0,
          risco: "baixo",
          analise: "Demanda precaucional plenamente atendida: excelente colchão de resiliência contra choques macroeconômicos e imprevistos."
        },
        {
          texto: "Por 3 a 5 meses de custos essenciais.",
          pontos: 1,
          risco: "baixo",
          analise: "Nível intermediário satisfatório de proteção, mitigando o risco de endividamento emergencial."
        },
        {
          texto: "Por no máximo 1 mês: qualquer imprevisto médico ou mecânico já desestabiliza as contas.",
          pontos: 3,
          risco: "alto",
          analise: "Vulnerabilidade severa a choques aleatórios: ausência de amortecedor financeiro induz ao recurso imediato ao crédito rotativo caro."
        },
        {
          texto: "Nem um único dia: não existe nenhuma reserva guardada e vivo no limite absoluto ou negativo.",
          pontos: 4,
          risco: "critico",
          analise: "Exposição máxima ao risco: qualquer volatilidade externa precipita o indivíduo diretamente na espiral de insolvência."
        }
      ]
    }
  ],

  // Dados Comparativos do Módulo D (Mitos vs Realidades)
  comparativoMacro: {
    rotulo: "Impacto Macroeconômico sobre o Orçamento Familiar no Brasil (R$ Bilhões/Ano)",
    itens: [
      {
        categoria: "Serviço da Dívida e Juros Pagos pelas Famílias",
        valorBilhoes: 696.8,
        percentualRenda: 11.2,
        descricao: "Juros e encargos financeiros transferidos pelas famílias ao setor bancário sob Selic restritiva e spreads elevados.",
        natureza: "Causa Macroeconômica Estrutural Primária",
        cor: "#DC2626"
      },
      {
        categoria: "Gastos Brutos das Famílias com Apostas Online (Bets)",
        valorBilhoes: 37.0,
        percentualRenda: 0.46,
        descricao: "Volume total estimado de apostas líquidas perdidas pelas famílias brasileiras no mercado de bets.",
        natureza: "Impacto Comportamental Residual (0,46% do Consumo)",
        cor: "#2563EB"
      }
    ],
    razaoProporcional: 18.83, // Juros é ~18,8x maior que as Bets
    conclusaoDidatica: "Em termos macroeconômicos estritos, a asfixia orçamentária familiar no Brasil decorre primariamente do nível da taxa básica (Selic a 14,5%), do spread bancário e do juro do rotativo (>400% a.a.), que absorvem R$ 696,8 bilhões por ano — valor quase 19 vezes superior ao total desembolsado em plataformas de apostas online (R$ 37 bilhões). O estudante de economia deve distinguir correlação midiática de causalidade estrutural nos agregados macroeconômicos."
  },

  // Parâmetros do Programa Desenrola Brasil (2026)
  desenrolaBrasil: {
    tetoDescontoPrincipal: 90, // até 90%
    descontoMedioSimulado: 80, // 80%
    tetoJurosMensal: 1.99, // % a.m.
    prazoMaximoMeses: 60, // 5 anos
    usoFGTS: true,
    bloqueioBetsMeses: 12, // Suspensão de CPF para apostas
    regras: [
      {
        titulo: "Desconto Agressivo de Principal",
        detalhe: "Redução de até 90% sobre o saldo consolidado de dívidas negativadas, eliminando o efeito bola de neve dos juros acumulados."
      },
      {
        titulo: "Teto Legal de Juros de 1,99% ao Mês",
        detalhe: "Financiamento em até 60 meses com taxa máxima de 1,99% a.m., contrapondo a taxa de 14,9% a.m. do rotativo."
      },
      {
        titulo: "Mobilização de Saldo Inativo do FGTS",
        detalhe: "Possibilidade de amortização imediata do saldo devedor residual utilizando recursos de contas inativas do FGTS."
      },
      {
        titulo: "Cláusula Protetiva de CPF Anti-Bets (12 Meses)",
        detalhe: "O beneficiário da repactuação tem seu CPF preventivamente bloqueado em plataformas autorizadas de apostas por 1 ano para proteger a recomposição de sua renda."
      }
    ]
  }
};

// Exporta para ambiente browser ou testes
if (typeof window !== 'undefined') {
  window.URCA_DATA = URCA_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = URCA_DATA;
}

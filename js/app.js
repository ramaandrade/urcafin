/**
 * URCAFin - Orquestrador Principal SPA
 * Coordenação de Estado, Eventos, Gráficos (Chart.js) e Laudo Acadêmico
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa os motores de cálculo
  const macroSim = new MacroSimulator(URCA_DATA);
  const diagEngine = new DiagnosticEngine(URCA_DATA);
  const minCalc = new MinimumExistentialCalculator(URCA_DATA);
  const mythsMgr = new MythsAndDataManager(URCA_DATA);

  // Instâncias globais de gráficos Chart.js
  let chartBolaNeve = null;
  let chartConsumoDecomposicao = null;
  let chartMinimoExistencial = null;
  let chartMacroJurosBets = null;

  // Estado da Aplicação
  const state = {
    respostasQuiz: {},
    resultadoDiag: null,
    resultadoMacro: null,
    resultadoConsumo: null,
    resultadoMinimo: null,
    resultadoDesenrola: null
  };

  // =========================================================================
  // 1. SISTEMA DE NAVEGAÇÃO EM ABAS (SPA)
  // =========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function alternarAba(targetId) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === targetId) {
        content.classList.remove('hidden');
        content.classList.add('block');
      } else {
        content.classList.add('hidden');
        content.classList.remove('block');
      }
    });

    // Redimensiona gráficos que estavam em abas ocultas
    setTimeout(() => {
      if (targetId === 'tab-modulo-a') {
        if (chartBolaNeve) chartBolaNeve.resize();
        if (chartConsumoDecomposicao) chartConsumoDecomposicao.resize();
      } else if (targetId === 'tab-modulo-c') {
        if (chartMinimoExistencial) chartMinimoExistencial.resize();
      } else if (targetId === 'tab-modulo-d') {
        if (chartMacroJurosBets) chartMacroJurosBets.resize();
      }
    }, 50);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      alternarAba(targetId);
    });
  });

  // =========================================================================
  // 2. MÓDULO A: SIMULADOR DE JUROS COMPOSTOS & MODELO ECONOMÉTRICO
  // =========================================================================
  const elSimValor = document.getElementById('sim-valor-inicial');
  const elSimMeses = document.getElementById('sim-meses');
  const elSimPagamento = document.getElementById('sim-pagamento');
  const elSimTaxaCustom = document.getElementById('sim-taxa-custom');

  const lblSimValor = document.getElementById('label-sim-valor-inicial');
  const lblSimMeses = document.getElementById('label-sim-meses');
  const lblSimPagamento = document.getElementById('label-sim-pagamento');
  const lblSimTaxaCustom = document.getElementById('label-sim-taxa-custom');

  function formatarMoeda(val) {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function inicializarGraficoBolaNeve() {
    const ctx = document.getElementById('chart-bola-neve').getContext('2d');
    chartBolaNeve = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Cartão Rotativo (440,5% a.a. / 14,9% a.m.)',
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            data: []
          },
          {
            label: 'Cheque Especial (130% a.a. / 7,2% a.m.)',
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            borderWidth: 2.5,
            tension: 0.3,
            data: []
          },
          {
            label: 'Crédito Consignado (24,8% a.a. / 1,87% a.m.)',
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 2.5,
            tension: 0.3,
            data: []
          },
          {
            label: 'Cenário Customizado',
            borderColor: '#6366F1',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            data: []
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatarMoeda(context.parsed.y)}`
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: { color: '#F1F5F9' },
            title: { display: true, text: 'Prazo Decorrido (Meses)', font: { size: 11, weight: 'bold' } }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: {
              callback: (val) => 'R$ ' + Number(val).toLocaleString('pt-BR')
            },
            title: { display: true, text: 'Saldo Devedor (R$)', font: { size: 11, weight: 'bold' } }
          }
        }
      }
    });
  }

  function atualizarSimulacaoMacro() {
    const valor = Number(elSimValor.value);
    const meses = Number(elSimMeses.value);
    const pagamento = Number(elSimPagamento.value);
    const taxaCustom = Number(elSimTaxaCustom.value);

    lblSimValor.textContent = formatarMoeda(valor);
    lblSimMeses.textContent = `${meses} meses`;
    lblSimPagamento.textContent = pagamento === 0 ? 'R$ 0,00 (Rolagem pura)' : formatarMoeda(pagamento);
    lblSimTaxaCustom.textContent = `${taxaCustom.toFixed(2)}% a.m.`;

    const res = macroSim.simularComparativo(valor, meses, pagamento, taxaCustom);
    state.resultadoMacro = res;

    // Atualiza KPIs
    document.getElementById('kpi-saldo-rotativo').textContent = formatarMoeda(res.rotativo.saldoFinal);
    document.getElementById('kpi-mult-rotativo').textContent = `${res.rotativo.multiplicador}x o inicial`;

    document.getElementById('kpi-saldo-cheque').textContent = formatarMoeda(res.chequeEspecial.saldoFinal);
    document.getElementById('kpi-mult-cheque').textContent = `${res.chequeEspecial.multiplicador}x o inicial`;

    document.getElementById('kpi-saldo-consignado').textContent = formatarMoeda(res.consignado.saldoFinal);
    document.getElementById('kpi-mult-consignado').textContent = `${res.consignado.multiplicador}x o inicial`;

    // Atualiza Gráfico
    if (chartBolaNeve) {
      const labels = res.rotativo.serie.map(item => `Mês ${item.mes}`);
      chartBolaNeve.data.labels = labels;
      chartBolaNeve.data.datasets[0].data = res.rotativo.serie.map(item => item.saldo);
      chartBolaNeve.data.datasets[1].data = res.chequeEspecial.serie.map(item => item.saldo);
      chartBolaNeve.data.datasets[2].data = res.consignado.serie.map(item => item.saldo);
      chartBolaNeve.data.datasets[3].data = res.customizado.serie.map(item => item.saldo);
      chartBolaNeve.data.datasets[3].label = `Cenário Custom (${taxaCustom.toFixed(1)}% a.m.)`;
      chartBolaNeve.update();
    }
  }

  [elSimValor, elSimMeses, elSimPagamento, elSimTaxaCustom].forEach(input => {
    input.addEventListener('input', atualizarSimulacaoMacro);
  });

  // Calculadora Econométrica de Consumo
  const elEcoRenda = document.getElementById('eco-renda');
  const elEcoParcela = document.getElementById('eco-parcela');
  const elEcoDivida = document.getElementById('eco-divida');
  const btnRecalcularEco = document.getElementById('btn-recalcular-econometrico');

  function inicializarGraficoConsumo() {
    const ctx = document.getElementById('chart-consumo-decomposicao').getContext('2d');
    chartConsumoDecomposicao = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Alimentação Básica', 'Capital Humano (Saúde/Educ.)', 'Duráveis & Lazer'],
        datasets: [{
          data: [28, 42, 30],
          backgroundColor: ['#EF4444', '#6366F1', '#F59E0B'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatarMoeda(ctx.parsed)}`
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  function atualizarModeloEconometrico() {
    const renda = Number(elEcoRenda.value) || 0;
    const parcela = Number(elEcoParcela.value) || 0;
    const divida = Number(elEcoDivida.value) || 0;

    const res = macroSim.calcularImpactoConsumo(renda, parcela, divida);
    state.resultadoConsumo = res;

    document.getElementById('eco-res-dsr').textContent = `${res.dsrPercentual}%`;
    document.getElementById('eco-res-dti').textContent = `${res.dtiAnual} anos`;
    document.getElementById('eco-res-consumo-mes').textContent = formatarMoeda(res.consumoPerdidoMensal);
    document.getElementById('eco-res-elasticidade').textContent = `${res.elasticidadeConsumoDti}`;

    document.getElementById('eco-res-status-titulo').textContent = res.nivelVulnerabilidade;
    document.getElementById('eco-res-status-desc').textContent = res.recomendacaoAcademica;

    if (chartConsumoDecomposicao) {
      chartConsumoDecomposicao.data.datasets[0].data = [
        res.decomposicao.alimentacao,
        res.decomposicao.capitalHumano,
        res.decomposicao.duraveisLazer
      ];
      chartConsumoDecomposicao.update();
    }
  }

  btnRecalcularEco.addEventListener('click', atualizarModeloEconometrico);
  [elEcoRenda, elEcoParcela, elEcoDivida].forEach(inp => inp.addEventListener('change', atualizarModeloEconometrico));

  // =========================================================================
  // 3. MÓDULO B: QUESTIONÁRIO DE DIAGNÓSTICO TEÓRICO (10 QUESTÕES)
  // =========================================================================
  const quizContainer = document.getElementById('quiz-container');
  const progressBar = document.getElementById('diagnostic-progress-bar');
  const progressText = document.getElementById('diagnostic-progress-text');
  const btnProcessarDiag = document.getElementById('btn-processar-diagnostico');
  const painelResultadoDiag = document.getElementById('painel-resultado-diagnostico');

  function renderizarQuestionario() {
    quizContainer.innerHTML = '';

    URCA_DATA.questoesDiagnostico.forEach(q => {
      const qCard = document.createElement('div');
      qCard.className = 'bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 hover-card transition';
      qCard.id = `card-questao-${q.id}`;

      let opcoesHtml = '';
      q.opcoes.forEach((op, idx) => {
        const checked = state.respostasQuiz[q.id] === idx ? 'checked' : '';
        opcoesHtml += `
          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 hover:border-emerald-300 cursor-pointer transition text-xs">
            <input type="radio" name="questao-${q.id}" value="${idx}" ${checked} class="mt-0.5 text-emerald-600 focus:ring-emerald-500">
            <div class="flex-1 text-slate-700 leading-relaxed">
              ${op.texto}
            </div>
          </label>
        `;
      });

      qCard.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-urca-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
              ${q.id}
            </span>
            <h4 class="font-bold text-sm text-slate-900">${q.titulo.replace(/^\d+\.\s*/, '')}</h4>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              ${q.teoria}
            </span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              ${q.conceitoChave}
            </span>
          </div>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed font-medium">${q.enunciado}</p>
        <div class="space-y-2 pt-1">
          ${opcoesHtml}
        </div>
      `;

      quizContainer.appendChild(qCard);
    });

    // Registra listeners nos radio buttons
    quizContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const questaoId = Number(e.target.name.replace('questao-', ''));
        const opcaoIdx = Number(e.target.value);
        state.respostasQuiz[questaoId] = opcaoIdx;
        atualizarProgressoQuestionario();
      });
    });

    atualizarProgressoQuestionario();
  }

  function atualizarProgressoQuestionario() {
    const total = URCA_DATA.questoesDiagnostico.length;
    const respondidas = Object.keys(state.respostasQuiz).length;
    const pct = (respondidas / total) * 100;

    progressBar.style.width = `${pct}%`;
    progressText.textContent = `${respondidas} / ${total} respondidas`;

    if (respondidas === total) {
      btnProcessarDiag.classList.add('ring-4', 'ring-emerald-300');
    } else {
      btnProcessarDiag.classList.remove('ring-4', 'ring-emerald-300');
    }
  }

  function processarDiagnostico() {
    const total = URCA_DATA.questoesDiagnostico.length;
    const respondidas = Object.keys(state.respostasQuiz).length;

    if (respondidas < total) {
      const confirmacao = confirm(`Você respondeu ${respondidas} de ${total} questões. Deseja processar o diagnóstico com as respostas atuais? (As não respondidas contarão como zero risco)`);
      if (!confirmacao) return;
    }

    const res = diagEngine.avaliar(state.respostasQuiz);
    state.resultadoDiag = res;

    // Atualiza Gauge
    // -90deg = 0 pontos, +90deg = 100 pontos
    const angulo = -90 + (res.indiceVulnerabilidade / 100) * 180;
    const needle = document.getElementById('gauge-needle');
    if (needle) {
      needle.style.transform = `rotate(${angulo}deg)`;
    }
    document.getElementById('diag-score-display').textContent = `${res.indiceVulnerabilidade} / 100`;

    // Atualiza Textos
    document.getElementById('diag-status-titulo').textContent = res.perfil.status;
    document.getElementById('diag-status-resumo').textContent = res.perfil.resumo;
    document.getElementById('diag-parecer-epistemologico').textContent = res.perfil.diagnosticoEpistemologico;
    document.getElementById('diag-diretriz-didatica').textContent = res.perfil.diretrizDidatica;

    // Alertas Críticos
    const containerAlertas = document.getElementById('diag-alertas-criticos-container');
    const listaAlertas = document.getElementById('diag-alertas-criticos-lista');
    listaAlertas.innerHTML = '';

    if (res.vulnerabilidadesCriticas.length > 0) {
      containerAlertas.classList.remove('hidden');
      res.vulnerabilidadesCriticas.forEach(v => {
        const item = document.createElement('div');
        item.className = 'p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-center justify-between';
        item.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            <span class="font-bold text-rose-900">${v.tema}</span>
          </div>
          <span class="text-[10px] font-bold uppercase text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">${v.gravidade}</span>
        `;
        listaAlertas.appendChild(item);
      });
    } else {
      containerAlertas.classList.add('hidden');
    }

    // Matriz Teórica Detalhada
    const matrizContainer = document.getElementById('diag-matriz-teorica');
    matrizContainer.innerHTML = '';

    res.analisesDetalhadas.forEach(a => {
      const card = document.createElement('div');
      const borderRisk = a.risco === 'critico' ? 'border-rose-300 bg-rose-50/40' : (a.risco === 'alto' ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white');
      card.className = `p-3.5 rounded-xl border ${borderRisk} space-y-2 text-xs`;
      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <span class="font-bold text-slate-800">${a.titulo}</span>
          <span class="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            +${a.pontos} pts
          </span>
        </div>
        <div class="text-[11px] text-slate-600 italic">
          " ${a.respostaEscolhida} "
        </div>
        <div class="p-2 rounded bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed">
          <strong class="text-urca-blue">${a.teoria}:</strong> ${a.analiseTeorica}
        </div>
        <div class="text-[11px] text-emerald-800">
          <strong>Diretriz Pedagógica:</strong> ${a.recomendacaoAcademica}
        </div>
      `;
      matrizContainer.appendChild(card);
    });

    painelResultadoDiag.classList.remove('hidden');
    painelResultadoDiag.scrollIntoView({ behavior: 'smooth' });
    lucide.createIcons();
  }

  btnProcessarDiag.addEventListener('click', processarDiagnostico);

  // =========================================================================
  // 4. MÓDULO C: CALCULADORA DO MÍNIMO EXISTENCIAL (LEI 14.181/2021)
  // =========================================================================
  const elCRenda = document.getElementById('c-renda-liquida');
  const elCDivida = document.getElementById('c-divida-total');
  const elCPrazo = document.getElementById('c-prazo-meses');
  const lblCPrazo = document.getElementById('label-c-prazo');

  const elCAlimentacao = document.getElementById('c-gasto-alimentacao');
  const elCAguaLuz = document.getElementById('c-gasto-agua-luz');
  const elCMoradia = document.getElementById('c-gasto-moradia');
  const elCSaude = document.getElementById('c-gasto-saude');
  const elCTransporte = document.getElementById('c-gasto-transporte');
  const elCOutros = document.getElementById('c-gasto-outros');
  const lblCTotalSubsistencia = document.getElementById('c-total-subsistencia');

  function inicializarGraficoMinimoExistencial() {
    const ctx = document.getElementById('chart-minimo-existencial').getContext('2d');
    chartMinimoExistencial = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Composição da Renda Familiar'],
        datasets: [
          {
            label: 'Mínimo Existencial (Subsistência Intocável)',
            data: [2400],
            backgroundColor: '#F59E0B'
          },
          {
            label: 'Parcela Proposta de Repactuação (Até 60m)',
            data: [300],
            backgroundColor: '#EF4444'
          },
          {
            label: 'Margem Residual Livre da Família',
            data: [100],
            backgroundColor: '#10B981'
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: { callback: (v) => 'R$ ' + Number(v).toLocaleString('pt-BR') }
          },
          y: { stacked: true }
        },
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatarMoeda(ctx.parsed.x)}`
            }
          }
        }
      }
    });
  }

  function atualizarCalculoMinimoExistencial() {
    const prazo = Number(elCPrazo.value);
    lblCPrazo.textContent = `${prazo} meses (${(prazo / 12).toFixed(1).replace('.0', '')} anos)`;

    const dados = {
      rendaLiquida: elCRenda.value,
      dividaTotal: elCDivida.value,
      prazoMeses: prazo,
      alimentacao: elCAlimentacao.value,
      aguaLuz: elCAguaLuz.value,
      moradia: elCMoradia.value,
      saude: elCSaude.value,
      transporte: elCTransporte.value,
      outrosEssenciais: elCOutros.value
    };

    const res = minCalc.calcularPlano(dados);
    state.resultadoMinimo = res;

    lblCTotalSubsistencia.textContent = formatarMoeda(res.despesas.total);

    // Alerta de Solvência
    const alertaBox = document.getElementById('c-alerta-solvencia');
    alertaBox.className = `rounded-2xl p-5 shadow-sm text-white transition-all ${res.classeAlerta}`;
    document.getElementById('c-alerta-status').textContent = res.statusRepactuacao;
    document.getElementById('c-alerta-descricao').textContent = res.descricaoDiagnostico;
    document.getElementById('c-recomendacao-judicial').textContent = res.recomendacaoJudicial;

    // KPIs
    document.getElementById('c-res-minimo').textContent = formatarMoeda(res.minimoExistencialEfetivo);
    document.getElementById('c-res-margem-livre').textContent = formatarMoeda(res.margemLivreReal);
    document.getElementById('c-res-teto30').textContent = formatarMoeda(res.tetoPrudencial30);
    document.getElementById('c-res-parcela').textContent = formatarMoeda(res.parcelaNecessaria);

    // Atualiza Gráfico de Barras Empilhadas
    if (chartMinimoExistencial) {
      const margemResidualFinal = Math.max(0, res.rendaLiquida - res.despesas.total - res.parcelaNecessaria);
      chartMinimoExistencial.data.datasets[0].data = [res.despesas.total];
      chartMinimoExistencial.data.datasets[1].data = [res.parcelaNecessaria];
      chartMinimoExistencial.data.datasets[2].data = [margemResidualFinal];
      chartMinimoExistencial.update();
    }
  }

  [elCRenda, elCDivida, elCPrazo, elCAlimentacao, elCAguaLuz, elCMoradia, elCSaude, elCTransporte, elCOutros].forEach(inp => {
    inp.addEventListener('input', atualizarCalculoMinimoExistencial);
  });

  // =========================================================================
  // 5. MÓDULO D: PAINEL DE DADOS MACRO & DESENROLA BRASIL (2026)
  // =========================================================================
  function inicializarGraficoMacroJurosBets() {
    const ctx = document.getElementById('chart-macro-juros-bets').getContext('2d');
    const dadosMacro = mythsMgr.obterDadosGraficoMacro();

    chartMacroJurosBets = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosMacro.labels,
        datasets: [{
          label: 'Impacto Anual no Orçamento das Famílias (R$ Bilhões)',
          data: dadosMacro.valores,
          backgroundColor: dadosMacro.cores,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E2E8F0'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Impacto Anual: R$ ${ctx.parsed.x.toFixed(1)} Bilhões`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#F1F5F9' },
            ticks: { callback: (v) => `R$ ${v} Bi` },
            title: { display: true, text: 'Volume Anual em R$ Bilhões (Cenário Macro Brasil)', font: { size: 11, weight: 'bold' } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { weight: 'bold' } }
          }
        }
      }
    });
  }

  // Controles do Desenrola
  const elDesDivida = document.getElementById('des-divida-original');
  const elDesDesconto = document.getElementById('des-desconto-pct');
  const elDesPrazo = document.getElementById('des-prazo-meses');
  const elDesFgts = document.getElementById('des-fgts');

  const lblDesDesconto = document.getElementById('label-des-desconto');
  const lblDesPrazo = document.getElementById('label-des-prazo');

  function atualizarSimulacaoDesenrola() {
    const divida = Number(elDesDivida.value) || 0;
    const desconto = Number(elDesDesconto.value) || 0;
    const prazo = Number(elDesPrazo.value) || 36;
    const fgts = Number(elDesFgts.value) || 0;

    lblDesDesconto.textContent = `${desconto}% de desconto`;
    lblDesPrazo.textContent = `${prazo} meses`;

    const res = mythsMgr.simularDesenrola(divida, desconto, prazo, fgts);
    state.resultadoDesenrola = res;

    document.getElementById('des-res-valor-com-desconto').textContent = formatarMoeda(res.valorComDesconto);
    document.getElementById('des-res-desc-kpi').textContent = `${desconto}%`;
    document.getElementById('des-res-parcela').textContent = `${formatarMoeda(res.parcelaDesenrola)} / mês`;
    document.getElementById('des-res-economia').textContent = formatarMoeda(res.economiaAbsoluta);

    document.getElementById('des-comp-rotativo').textContent = formatarMoeda(res.dividaRotativo1Ano);
    document.getElementById('des-comp-desenrola').textContent = formatarMoeda(res.totalPagoDesenrola);

    const pctBar = Math.min(100, Math.max(5, (res.totalPagoDesenrola / (res.dividaRotativo1Ano || 1)) * 100));
    document.getElementById('des-bar-desenrola').style.width = `${pctBar}%`;
  }

  [elDesDivida, elDesDesconto, elDesPrazo, elDesFgts].forEach(inp => {
    inp.addEventListener('input', atualizarSimulacaoDesenrola);
  });

  // =========================================================================
  // 6. MODAL DO GLOSSÁRIO & MODAL DO LAUDO ACADÊMICO
  // =========================================================================
  const modalGlossario = document.getElementById('modal-glossario');
  const btnAbrirGlossario = document.getElementById('btn-abrir-glossario');
  const btnFecharGlossario = document.getElementById('btn-fechar-glossario');

  btnAbrirGlossario.addEventListener('click', () => modalGlossario.classList.remove('hidden'));
  btnFecharGlossario.addEventListener('click', () => modalGlossario.classList.add('hidden'));

  const modalLaudo = document.getElementById('modal-laudo');
  const btnGerarLaudo = document.getElementById('btn-gerar-laudo');
  const btnFecharLaudo = document.getElementById('btn-fechar-laudo');
  const btnImprimirLaudo = document.getElementById('btn-imprimir-laudo');
  const corpoLaudo = document.getElementById('laudo-resumo-corpo');

  function renderizarLaudoAcademico() {
    const diag = state.resultadoDiag || diagEngine.avaliar(state.respostasQuiz);
    const macro = state.resultadoMacro || macroSim.simularComparativo(3000, 12, 0);
    const min = state.resultadoMinimo || minCalc.calcularPlano({ rendaLiquida: 2800, dividaTotal: 18000, prazoMeses: 60 });
    const desenrola = state.resultadoDesenrola || mythsMgr.simularDesenrola(6000, 80, 36, 300);

    corpoLaudo.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Bloco 1: Diagnóstico Teórico -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
          <div class="text-[11px] font-bold text-urca-blue uppercase flex items-center justify-between">
            <span>Módulo B: Diagnóstico Epistemológico</span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono-num font-extrabold">${diag.indiceVulnerabilidade}/100</span>
          </div>
          <div class="font-bold text-slate-800">${diag.perfil.status}</div>
          <p class="text-[11px] text-slate-600 leading-relaxed">${diag.perfil.diagnosticoEpistemologico}</p>
          <div class="text-[11px] text-emerald-700"><strong>Diretriz:</strong> ${diag.perfil.diretrizDidatica}</div>
        </div>

        <!-- Bloco 2: Mínimo Existencial Lei 14.181 -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
          <div class="text-[11px] font-bold text-urca-blue uppercase flex items-center justify-between">
            <span>Módulo C: Lei do Superendividamento</span>
            <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono-num font-bold">60 Meses</span>
          </div>
          <div class="font-bold text-slate-800">${min.statusRepactuacao}</div>
          <div class="text-[11px] text-slate-600">Mínimo Existencial Intocável: <strong>${formatarMoeda(min.minimoExistencialEfetivo)}</strong></div>
          <div class="text-[11px] text-slate-600">Parcela Quinquenal: <strong>${formatarMoeda(min.parcelaNecessaria)}</strong> (${min.percentualRendaParcela}% da renda)</div>
          <div class="text-[11px] text-slate-600">Recomendação: ${min.recomendacaoJudicial}</div>
        </div>

        <!-- Bloco 3: Simulação Macro e Juros Compostos -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
          <div class="text-[11px] font-bold text-urca-blue uppercase">Módulo A: Efeito Bola de Neve</div>
          <div class="text-[11px] text-slate-700">
            Dívida Simulada de <strong>${formatarMoeda(macro.rotativo.valorInicial)}</strong> em 12 meses:<br>
            • Rotativo (440,5% a.a.): <strong class="text-rose-600">${formatarMoeda(macro.rotativo.saldoFinal)}</strong> (${macro.rotativo.multiplicador}x)<br>
            • Consignado (24,8% a.a.): <strong class="text-emerald-700">${formatarMoeda(macro.consignado.saldoFinal)}</strong> (${macro.consignado.multiplicador}x)
          </div>
        </div>

        <!-- Bloco 4: Dados Macro & Desenrola -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
          <div class="text-[11px] font-bold text-urca-blue uppercase">Módulo D: Macro & Desenrola 2026</div>
          <div class="text-[11px] text-slate-700">
            • Juros pagos anualmente pelas famílias brasileiras: <strong>R$ 696,8 bilhões</strong>.<br>
            • Apostas online (bets): <strong>R$ 37,0 bilhões</strong> (0,46% do consumo).<br>
            • Acordo Desenrola: Dívida de ${formatarMoeda(desenrola.dividaOriginal)} repactuada com ${desenrola.percentualDesconto}% de desconto por <strong>${formatarMoeda(desenrola.parcelaDesenrola)}/mês</strong>.
          </div>
        </div>
      </div>
    `;

    modalLaudo.classList.remove('hidden');
    lucide.createIcons();
  }

  btnGerarLaudo.addEventListener('click', renderizarLaudoAcademico);
  btnFecharLaudo.addEventListener('click', () => modalLaudo.classList.add('hidden'));
  btnImprimirLaudo.addEventListener('click', () => {
    window.print();
  });

  // Fecha modal ao clicar fora
  [modalGlossario, modalLaudo].forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.add('hidden');
    });
  });

  // =========================================================================
  // 7. INICIALIZAÇÃO GERAL DA APLICAÇÃO
  // =========================================================================
  renderizarQuestionario();
  inicializarGraficoBolaNeve();
  inicializarGraficoConsumo();
  inicializarGraficoMinimoExistencial();
  inicializarGraficoMacroJurosBets();

  atualizarSimulacaoMacro();
  atualizarModeloEconometrico();
  atualizarCalculoMinimoExistencial();
  atualizarSimulacaoDesenrola();

  lucide.createIcons();
});

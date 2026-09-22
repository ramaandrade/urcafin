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
    if (typeof fecharPopoverCalculo === 'function') {
      fecharPopoverCalculo();
    }
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
    if (typeof atualizarPopoverSeAberto === 'function') {
      atualizarPopoverSeAberto();
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
    if (typeof atualizarPopoverSeAberto === 'function') {
      atualizarPopoverSeAberto();
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
    if (typeof atualizarPopoverSeAberto === 'function') {
      atualizarPopoverSeAberto();
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
    if (typeof atualizarPopoverSeAberto === 'function') {
      atualizarPopoverSeAberto();
    }
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
  // 6.1 MOTOR DE MEMÓRIAS DE CÁLCULO E TOOLTIPS DIDÁTICOS (URCA)
  // =========================================================================
  const calcPopover = document.getElementById('calc-popover');
  const popoverTitle = document.getElementById('popover-title');
  const popoverFormula = document.getElementById('popover-formula');
  const popoverSubstitution = document.getElementById('popover-substitution');
  const popoverInterpretation = document.getElementById('popover-interpretation');
  const popoverCloseBtn = document.getElementById('popover-close-btn');

  const modalCadernoFormulas = document.getElementById('modal-caderno-formulas');
  const btnAbrirCadernoFormulas = document.getElementById('btn-abrir-caderno-formulas');
  const btnFecharCadernoFormulas = document.getElementById('btn-fechar-caderno-formulas');
  const btnFecharCadernoFormulasBottom = document.getElementById('btn-fechar-caderno-formulas-bottom');
  const cadernoFormulasConteudo = document.getElementById('caderno-formulas-conteudo');

  /**
   * Gera a memória de cálculo detalhada em tempo real com base nos inputs atuais
   */
  function obterMemoriaCalculo(calcId) {
    const valorInicial = Number(elSimValor.value) || 3000;
    const prazoMeses = Number(elSimMeses.value) || 12;
    const pagamentoMensal = Number(elSimPagamento.value) || 0;

    const rendaEco = Number(elEcoRenda.value) || 3500;
    const parcelaEco = Number(elEcoParcela.value) || 1200;
    const dividaEco = Number(elEcoDivida.value) || 14000;

    const rendaMin = Number(elCRenda.value) || 2800;
    const dividaMin = Number(elCDivida.value) || 18000;
    const prazoMin = Number(elCPrazo.value) || 60;
    const alimMin = Number(elCAlimentacao.value) || 950;
    const aguaLuzMin = Number(elCAguaLuz.value) || 380;
    const moradiaMin = Number(elCMoradia.value) || 600;
    const saudeMin = Number(elCSaude.value) || 220;
    const transpMin = Number(elCTransporte.value) || 180;
    const outrosMin = Number(elCOutros.value) || 70;
    const totalDespMin = alimMin + aguaLuzMin + moradiaMin + saudeMin + transpMin + outrosMin;

    const dividaDes = Number(elDesDivida.value) || 6000;
    const descDes = Number(elDesDesconto.value) || 80;
    const prazoDes = Number(elDesPrazo.value) || 36;
    const fgtsDes = Number(elDesFgts.value) || 300;

    const macro = state.resultadoMacro || macroSim.simularComparativo(valorInicial, prazoMeses, pagamentoMensal);
    const eco = state.resultadoConsumo || macroSim.calcularImpactoConsumo(rendaEco, parcelaEco, dividaEco);
    const minRes = state.resultadoMinimo || minCalc.calcularPlano({
      rendaLiquida: rendaMin,
      dividaTotal: dividaMin,
      prazoMeses: prazoMin,
      alimentacao: alimMin,
      aguaLuz: aguaLuzMin,
      moradia: moradiaMin,
      saude: saudeMin,
      transporte: transpMin,
      outrosEssenciais: outrosMin
    });
    const desRes = state.resultadoDesenrola || mythsMgr.simularDesenrola(dividaDes, descDes, prazoDes, fgtsDes);

    switch (calcId) {
      // --- MÓDULO A: BOLA DE NEVE ---
      case 'saldo-rotativo':
        return {
          titulo: 'Saldo Devedor: Cartão Rotativo (440,5% a.a.)',
          formula: 'Saldo_t = Saldo_{t-1} × (1 + i) - PMT \nou M = PV × (1 + i)^n  [se PMT = 0]',
          substituicao: `PV = ${formatarMoeda(valorInicial)} | i = 14,92% a.m. (0,1492) | n = ${prazoMeses} meses\n` +
                        `M = ${formatarMoeda(valorInicial)} × (1 + 0,1492)^${prazoMeses} = ${formatarMoeda(macro.rotativo.saldoFinal)}\n` +
                        `Juros Acumulados = ${formatarMoeda(macro.rotativo.jurosTotaisAcumulados)}`,
          interpretacao: 'Sob taxa de 14,92% ao mês, a curva exponencial faz com que o pagamento de juros supere amplamente o valor original em menos de 6 meses.'
        };

      case 'mult-rotativo':
        return {
          titulo: 'Multiplicador do Passivo: Rotativo',
          formula: 'Multiplicador = (Saldo Final + Pagamentos Acumulados) / Dívida Inicial',
          substituicao: `Multiplicador = (${formatarMoeda(macro.rotativo.saldoFinal)} + ${formatarMoeda(macro.rotativo.pagamentosTotaisAcumulados)}) / ${formatarMoeda(valorInicial)}\n` +
                        `Multiplicador = ${macro.rotativo.multiplicador}x o valor inicial`,
          interpretacao: 'Expressa quantas vezes a dívida cresceu em relação ao montante originalmente tomado.'
        };

      case 'tempo-dobro-rotativo':
        return {
          titulo: 'Tempo para a Dívida Dobrar: Rotativo',
          formula: 'T_{dobro} = ln(2) / ln(1 + i)  ≈ 72 / i_% (Regra dos 72)',
          substituicao: `i = 14,92% a.m. (0,1492)\n` +
                        `T_{dobro} = ln(2) / ln(1 + 0,1492) = 0,69315 / 0,13903 ≈ ${macro.rotativo.tempoDobroMeses} meses\n` +
                        `Pela Regra dos 72: 72 / 14,92 ≈ 4,8 meses`,
          interpretacao: 'Demonstra a velocidade alarmante com que a capitalização contínua dobra o saldo devedor sem necessidade de novas compras.'
        };

      case 'saldo-cheque':
        return {
          titulo: 'Saldo Devedor: Cheque Especial (130,0% a.a.)',
          formula: 'M = PV × (1 + i)^n  [com taxa mensal regulada i = 7,18% a.m.]',
          substituicao: `PV = ${formatarMoeda(valorInicial)} | i = 7,18% a.m. (0,0718) | n = ${prazoMeses} meses\n` +
                        `M = ${formatarMoeda(valorInicial)} × (1 + 0,0718)^${prazoMeses} = ${formatarMoeda(macro.chequeEspecial.saldoFinal)}\n` +
                        `Juros Acumulados = ${formatarMoeda(macro.chequeEspecial.jurosTotaisAcumulados)}`,
          interpretacao: 'Embora tenha taxa inferior ao rotativo, o cheque especial dobra o passivo em cerca de 10 meses caso mantido em aberto.'
        };

      case 'mult-cheque':
        return {
          titulo: 'Multiplicador do Passivo: Cheque Especial',
          formula: 'Multiplicador = (Saldo Final + Pagamentos Acumulados) / Dívida Inicial',
          substituicao: `Multiplicador = (${formatarMoeda(macro.chequeEspecial.saldoFinal)} + ${formatarMoeda(macro.chequeEspecial.pagamentosTotaisAcumulados)}) / ${formatarMoeda(valorInicial)} = ${macro.chequeEspecial.multiplicador}x`,
          interpretacao: 'Mede o crescimento proporcional do saldo devedor acumulado no cheque especial.'
        };

      case 'tempo-dobro-cheque':
        return {
          titulo: 'Tempo para a Dívida Dobrar: Cheque Especial',
          formula: 'T_{dobro} = ln(2) / ln(1 + i)',
          substituicao: `i = 7,18% a.m. (0,0718)\n` +
                        `T_{dobro} = ln(2) / ln(1 + 0,0718) = 0,69315 / 0,06934 ≈ ${macro.chequeEspecial.tempoDobroMeses} meses`,
          interpretacao: 'Em menos de 1 ano (10 meses), o saldo devido no cheque especial é duplicado.'
        };

      case 'saldo-consignado':
        return {
          titulo: 'Saldo Devedor: Crédito Consignado (24,8% a.a.)',
          formula: 'M = PV × (1 + i)^n  [com taxa prudencial i = 1,87% a.m.]',
          substituicao: `PV = ${formatarMoeda(valorInicial)} | i = 1,87% a.m. (0,0187) | n = ${prazoMeses} meses\n` +
                        `M = ${formatarMoeda(valorInicial)} × (1 + 0,0187)^${prazoMeses} = ${formatarMoeda(macro.consignado.saldoFinal)}\n` +
                        `Juros Acumulados = ${formatarMoeda(macro.consignado.jurosTotaisAcumulados)}`,
          interpretacao: 'Por possuir desconto em folha e menor risco de crédito, a taxa de 1,87% a.m. gera estabilidade e crescimento quase linear.'
        };

      case 'mult-consignado':
        return {
          titulo: 'Multiplicador do Passivo: Consignado',
          formula: 'Multiplicador = (Saldo Final + Pagamentos Acumulados) / Dívida Inicial',
          substituicao: `Multiplicador = ${formatarMoeda(macro.consignado.saldoFinal)} / ${formatarMoeda(valorInicial)} = ${macro.consignado.multiplicador}x`,
          interpretacao: 'O consignado cresce apenas 25% ao ano contra os mais de 430% do cartão rotativo.'
        };

      case 'tempo-dobro-consignado':
        return {
          titulo: 'Tempo para a Dívida Dobrar: Consignado',
          formula: 'T_{dobro} = ln(2) / ln(1 + i)',
          substituicao: `i = 1,87% a.m. (0,0187)\n` +
                        `T_{dobro} = ln(2) / ln(1 + 0,0187) ≈ ${macro.consignado.tempoDobroMeses} meses (mais de 3 anos)`,
          interpretacao: 'Leva mais de 37 meses para dobrar, permitindo planejamento de longo prazo e amortização consistente.'
        };

      // --- MÓDULO A: MODELO ECONOMÉTRICO ---
      case 'dsr':
        return {
          titulo: 'Comprometimento da Renda Mensal (DSR - Debt Service Ratio)',
          formula: 'DSR = (Serviço Mensal da Dívida / Renda Líquida Mensal) × 100',
          substituicao: `DSR = (${formatarMoeda(parcelaEco)} / ${formatarMoeda(rendaEco)}) × 100\n` +
                        `DSR = ${((parcelaEco / (rendaEco || 1)) * 100).toFixed(2)}% ≈ ${eco.dsrPercentual}%`,
          interpretacao: 'Teto prudencial recomendado por órgãos reguladores e bancos centrais: 30%. Acima de 30%, o orçamento entra na Zona Especulativa de Minsky.'
        };

      case 'dti':
        return {
          titulo: 'Razão Dívida/Renda (DTI - Debt-to-Income)',
          formula: 'DTI_{anos} = Dívida Total / (Renda Mensal × 12)\nDTI_{meses} = Dívida Total / Renda Mensal',
          substituicao: `Renda Anual = ${formatarMoeda(rendaEco)} × 12 = ${formatarMoeda(rendaEco * 12)}\n` +
                        `DTI_{anos} = ${formatarMoeda(dividaEco)} / ${formatarMoeda(rendaEco * 12)} = ${eco.dtiAnual} anos\n` +
                        `DTI_{meses} = ${formatarMoeda(dividaEco)} / ${formatarMoeda(rendaEco)} = ${(dividaEco / (rendaEco || 1)).toFixed(1)} meses de renda líquida`,
          interpretacao: 'Indica quantos meses ou anos de salário integral seriam necessários apenas para quitar o principal das dívidas acumuladas.'
        };

      case 'consumo-perdido':
        return {
          titulo: 'Consumo Perdido Mensalmente (Efeito Crowding-Out)',
          formula: 'ΔC = Serviço Mensal da Dívida × PMC  [com PMC = 0,82]',
          substituicao: `Serviço da Dívida = ${formatarMoeda(parcelaEco)}\n` +
                        `PMC (Propensão Marginal a Consumir) = 0,82\n` +
                        `ΔC = ${formatarMoeda(parcelaEco)} × 0,82 = ${formatarMoeda(eco.consumoPerdidoMensal)} / mês\n` +
                        `Impacto Anualizado = ${formatarMoeda(eco.consumoPerdidoAnual)} / ano`,
          interpretacao: 'Cada R$ 1,00 pago em amortização e juros bancários desloca R$ 0,82 que seriam diretamente injetados na economia real em bens e serviços.'
        };

      case 'elasticidade':
        return {
          titulo: 'Elasticidade Consumo-Dívida (ε_{C, DTI})',
          formula: 'ε_{C, DTI} = -(0,25 + 0,008 × DSR)',
          substituicao: `DSR = ${eco.dsrPercentual}%\n` +
                        `ε = -(0,25 + 0,008 × ${eco.dsrPercentual})\n` +
                        `ε = -(0,25 + ${(0.008 * eco.dsrPercentual).toFixed(3)}) = ${eco.elasticidadeConsumoDti}`,
          interpretacao: 'O sinal negativo comprova que o endividamento comprime o consumo agregado. Para cada 10% de elevação na razão dívida/renda, o consumo se contrai em ' + Math.abs(eco.elasticidadeConsumoDti * 10).toFixed(1) + '%.'
        };

      case 'decomposicao-consumo':
        return {
          titulo: 'Decomposição Setorial do Consumo Sacrificado',
          formula: 'Alimentação = ΔC × 28%\nCapital Humano (Saúde/Educ.) = ΔC × 42%\nDuráveis & Lazer = ΔC × 30%',
          substituicao: `Consumo Total Perdido (ΔC) = ${formatarMoeda(eco.consumoPerdidoMensal)}\n` +
                        `• Alimentação Básica (28%): ${formatarMoeda(eco.decomposicao.alimentacao)}\n` +
                        `• Capital Humano (42%): ${formatarMoeda(eco.decomposicao.capitalHumano)} [MAIOR SACRIFÍCIO]\n` +
                        `• Duráveis & Lazer (30%): ${formatarMoeda(eco.decomposicao.duraveisLazer)}`,
          interpretacao: 'Demonstra que a asfixia financeira atinge com maior intensidade gastos de futuro (educação dos filhos, cursos, medicamentos) do que bens de consumo imediato.'
        };

      // --- MÓDULO C: MÍNIMO EXISTENCIAL ---
      case 'minimo-existencial':
        return {
          titulo: 'Mínimo Existencial Efetivo (Lei 14.181/2021)',
          formula: 'Mínimo = max(Piso Infralegal Dec. 11.567 [R$ 600], Σ Despesas Essenciais Comprovadas)',
          substituicao: `Σ Despesas Comprovadas = ${formatarMoeda(alimMin)} (Alim.) + ${formatarMoeda(aguaLuzMin)} (Contas) + ${formatarMoeda(moradiaMin)} (Moradia) + ${formatarMoeda(saudeMin)} (Saúde) + ${formatarMoeda(transpMin)} (Transp.) + ${formatarMoeda(outrosMin)} (Outros) = ${formatarMoeda(totalDespMin)}\n` +
                        `Piso do Decreto 11.567/2023 = R$ 600,00\n` +
                        `Mínimo Existencial Efetivo = max(600, ${totalDespMin}) = ${formatarMoeda(minRes.minimoExistencialEfetivo)}`,
          interpretacao: 'O Mínimo Existencial é a parcela da renda juridicamente intocável pelos credores para resguardar a dignidade e a sobrevivência física da pessoa humana.'
        };

      case 'margem-livre':
        return {
          titulo: 'Margem Orçamentária Livre Real para Credores',
          formula: 'Margem Livre = max(0, Renda Familiar Líquida - Despesas Essenciais Comprovadas)',
          substituicao: `Renda Líquida = ${formatarMoeda(rendaMin)}\n` +
                        `Despesas Essenciais = ${formatarMoeda(totalDespMin)}\n` +
                        `Margem Livre = max(0, ${formatarMoeda(rendaMin)} - ${formatarMoeda(totalDespMin)}) = ${formatarMoeda(minRes.margemLivreReal)}`,
          interpretacao: 'Indica a folga líquida real que sobra após pagar alimentação, moradia e saúde para amortizar dívidas repactuadas.'
        };

      case 'teto-prudencial':
        return {
          titulo: 'Teto Prudencial Consignável (30%)',
          formula: 'Teto Prudencial = Renda Familiar Líquida × 30%',
          substituicao: `Teto = ${formatarMoeda(rendaMin)} × 0,30 = ${formatarMoeda(minRes.tetoPrudencial30)}`,
          interpretacao: 'Limite legal de desconto estabelecido para preservar a solvência corrente. Qualquer parcela acima desse valor gera vulnerabilidade excessiva.'
        };

      case 'parcela-quinquenal':
        return {
          titulo: 'Parcela Linear Quinquenal da Repactuação (60 Meses)',
          formula: 'Parcela = Passivo Consolidado / Prazo em Meses (Expurgo de Juros Moratórios)',
          substituicao: `Dívida Consolidada = ${formatarMoeda(dividaMin)}\n` +
                        `Prazo Legal = ${prazoMin} meses (${(prazoMin / 12).toFixed(1)} anos)\n` +
                        `Parcela = ${formatarMoeda(dividaMin)} / ${prazoMin} = ${formatarMoeda(minRes.parcelaNecessaria)} / mês\n` +
                        `Comprometimento da Renda = ${minRes.percentualRendaParcela}% da renda líquida`,
          interpretacao: 'Sob o rito do Art. 104-A do CDC, juros moratórios e multas punitivas são suspensos, parcelando o principal em até 5 anos.'
        };

      // --- MÓDULO D: MACRO & DESENROLA ---
      case 'proporcao-macro':
        return {
          titulo: 'Proporção Macroeconômica: Juros Bancários vs. Bets',
          formula: 'Razão = Juros Anuais Pagos pelas Famílias / Gastos Anuais Brutos em Bets',
          substituicao: `Juros Pagos pelas Famílias no Brasil = R$ 696,8 Bilhões/ano (11,2% da renda)\n` +
                        `Gastos com Apostas Online (Bets) = R$ 37,0 Bilhões/ano (0,46% do consumo)\n` +
                        `Razão = 696,8 / 37,0 ≈ 18,83x`,
          interpretacao: 'O dispêndio das famílias brasileiras com juros bancários é quase 19 vezes maior do que os gastos em apostas online, demonstrando a primazia dos spreads bancários na restrição de renda.'
        };

      case 'desenrola-desconto':
        return {
          titulo: 'Novo Valor da Dívida com Desconto do Desenrola Brasil',
          formula: 'Valor com Desconto = Dívida Original × (1 - Desconto%)',
          substituicao: `Dívida Original = ${formatarMoeda(dividaDes)}\n` +
                        `Percentual de Desconto Homologado = ${descDes}%\n` +
                        `Valor com Desconto = ${formatarMoeda(dividaDes)} × (1 - ${descDes / 100}) = ${formatarMoeda(desRes.valorComDesconto)}\n` +
                        `Abatimento com FGTS Inativo = - ${formatarMoeda(fgtsDes)}\n` +
                        `Saldo Efetivo a Financiar = ${formatarMoeda(desRes.saldoAFinanciar)}`,
          interpretacao: 'O programa elimina juros sobre juros e encargos moratórios, reduzindo o principal a um patamar compatível com a capacidade de pagamento.'
        };

      case 'desenrola-parcela':
        return {
          titulo: 'Prestação Mensal no Desenrola pela Tabela Price (1,99% a.m.)',
          formula: 'PMT = Saldo a Financiar × [i × (1 + i)^n] / [(1 + i)^n - 1]  [com i = 1,99% a.m.]',
          substituicao: `Saldo a Financiar = ${formatarMoeda(desRes.saldoAFinanciar)}\n` +
                        `Taxa Legal Teto (i) = 1,99% a.m. (0,0199)\n` +
                        `Prazo (n) = ${prazoDes} meses\n` +
                        `Fator Price = (0,0199 × 1,0199^${prazoDes}) / (1,0199^${prazoDes} - 1)\n` +
                        `Parcela Mensal = ${formatarMoeda(desRes.parcelaDesenrola)} / mês`,
          interpretacao: 'A taxa subsidiada de 1,99% ao mês contrasta com os 14,92% ao mês do rotativo, viabilizando parcelas suaves que cabem no salário.'
        };

      case 'desenrola-economia':
        return {
          titulo: 'Economia Total Gerada pela Repactuação no Desenrola',
          formula: 'Economia = Projeção da Dívida Rolando no Rotativo por 1 Ano - Total Pago no Desenrola',
          substituicao: `Dívida Rolando 1 Ano no Rotativo (14,92% a.m.) = ${formatarMoeda(desRes.dividaRotativo1Ano)}\n` +
                        `Total Efetivo Pago no Desenrola (${prazoDes}x + FGTS) = ${formatarMoeda(desRes.totalPagoDesenrola)}\n` +
                        `Economia Absoluta = ${formatarMoeda(desRes.economiaAbsoluta)} (${desRes.economiaPercentual}% de desconto real)`,
          interpretacao: 'Comprova o alívio orçamentário proporcionado por renegociações estruturadas versus a rolagem passiva no cartão de crédito.'
        };

      default:
        return {
          titulo: 'Memória de Cálculo Didática',
          formula: 'Y = f(X)',
          substituicao: 'Selecione um indicador válido na interface.',
          interpretacao: 'Cálculo formulado de acordo com a literatura econômica do curso de Ciências Econômicas da URCA.'
        };
    }
  }

  let currentActiveBtn = null;

  /**
   * Posiciona o popover flutuante imediatamente adjacente ao botão acionador,
   * utilizando coordenadas da viewport (sem adicionar scroll offsets que causavam deslocamento)
   */
  function posicionarPopover(targetBtn) {
    if (!targetBtn || calcPopover.classList.contains('hidden')) return;

    const rect = targetBtn.getBoundingClientRect();
    const margin = 12;
    const popoverWidth = Math.min(390, window.innerWidth - (margin * 2));

    calcPopover.style.width = `${popoverWidth}px`;

    // Altura real renderizada pelo navegador
    const popoverHeight = calcPopover.offsetHeight || 300;

    // Alinhamento horizontal: centraliza em relação ao centro do botão
    let left = rect.left + (rect.width / 2) - (popoverWidth / 2);

    // Ajusta limites para não vazar as bordas da tela
    if (left < margin) {
      left = margin;
    } else if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - popoverWidth - margin;
    }

    // Avaliação do espaço vertical relativo ao viewport (sem window.scrollY!)
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    let top;
    // Se couber abaixo com folga de 8px
    if (spaceBelow >= popoverHeight + 8) {
      top = rect.bottom + 8;
    } else if (spaceAbove >= popoverHeight + 8) {
      // Se não couber abaixo mas couber acima com folga de 8px
      top = rect.top - popoverHeight - 8;
    } else {
      // Caso a tela seja verticalmente apertada (ex: mobile horizontal),
      // coloca no lado que tiver mais espaço livre
      if (spaceBelow >= spaceAbove) {
        top = rect.bottom + 8;
      } else {
        top = Math.max(margin, rect.top - popoverHeight - 8);
      }
    }

    // Trava de segurança: nunca renderiza fora da área visível da viewport
    top = Math.max(margin, Math.min(top, window.innerHeight - popoverHeight - margin));

    calcPopover.style.left = `${Math.round(left)}px`;
    calcPopover.style.top = `${Math.round(top)}px`;
  }

  /**
   * Exibe o Popover flutuante posicionado perto do botão acionador
   */
  function exibirPopoverCalculo(calcId, targetBtn) {
    // Se o mesmo botão for clicado enquanto já estiver aberto, fecha (toggle)
    if (currentActiveBtn === targetBtn && !calcPopover.classList.contains('hidden')) {
      fecharPopoverCalculo();
      return;
    }

    if (currentActiveBtn) {
      currentActiveBtn.classList.remove('active');
    }

    currentActiveBtn = targetBtn;
    if (currentActiveBtn) {
      currentActiveBtn.classList.add('active');
    }

    const memoria = obterMemoriaCalculo(calcId);

    popoverTitle.textContent = memoria.titulo;
    popoverFormula.textContent = memoria.formula;
    popoverSubstitution.textContent = memoria.substituicao;
    popoverInterpretation.textContent = memoria.interpretacao;

    calcPopover.classList.remove('hidden');

    posicionarPopover(targetBtn);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function fecharPopoverCalculo() {
    calcPopover.classList.add('hidden');
    if (currentActiveBtn) {
      currentActiveBtn.classList.remove('active');
      currentActiveBtn = null;
    }
  }

  function atualizarPopoverSeAberto() {
    if (currentActiveBtn && !calcPopover.classList.contains('hidden')) {
      const calcId = currentActiveBtn.getAttribute('data-calc-id');
      if (calcId) {
        const memoria = obterMemoriaCalculo(calcId);
        popoverTitle.textContent = memoria.titulo;
        popoverFormula.textContent = memoria.formula;
        popoverSubstitution.textContent = memoria.substituicao;
        popoverInterpretation.textContent = memoria.interpretacao;
        posicionarPopover(currentActiveBtn);
      }
    }
  }

  // Registra listeners nos botões de tooltip de cálculo
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc-tooltip-btn');
    if (btn) {
      e.stopPropagation();
      const calcId = btn.getAttribute('data-calc-id');
      if (calcId) {
        exibirPopoverCalculo(calcId, btn);
      }
      return;
    }

    // Fecha se clicou fora do popover
    if (!calcPopover.classList.contains('hidden') && !e.target.closest('#calc-popover')) {
      fecharPopoverCalculo();
    }
  });

  if (popoverCloseBtn) {
    popoverCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fecharPopoverCalculo();
    });
  }

  // Fecha no ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !calcPopover.classList.contains('hidden')) {
      fecharPopoverCalculo();
    }
  });

  // Atualiza posição no resize da janela
  window.addEventListener('resize', () => {
    if (currentActiveBtn && !calcPopover.classList.contains('hidden')) {
      posicionarPopover(currentActiveBtn);
    }
  });

  // Gerencia o scroll: reposiciona se o botão estiver visível, fecha se o botão sair da tela
  window.addEventListener('scroll', (e) => {
    // Não fecha se o scroll for interno do próprio popover
    if (e.target && e.target.closest && e.target.closest('#calc-popover')) {
      return;
    }
    if (currentActiveBtn && !calcPopover.classList.contains('hidden')) {
      const rect = currentActiveBtn.getBoundingClientRect();
      // Se o botão rolou para fora da tela (acima ou abaixo com folga de 30px)
      if (rect.bottom < 30 || rect.top > window.innerHeight - 30) {
        fecharPopoverCalculo();
      } else {
        posicionarPopover(currentActiveBtn);
      }
    }
  }, { passive: true, capture: true });

  /**
   * Renderiza o Caderno Completo de Fórmulas e Memórias no Modal
   */
  function renderizarCadernoFormulas() {
    const listaIds = [
      { modulo: '📈 Módulo A: Efeito Bola de Neve & Juros Compostos', ids: ['saldo-rotativo', 'mult-rotativo', 'tempo-dobro-rotativo', 'saldo-cheque', 'mult-cheque', 'tempo-dobro-cheque', 'saldo-consignado', 'mult-consignado', 'tempo-dobro-consignado'] },
      { modulo: '🛍️ Módulo A: Modelo Econométrico de Crowding-out do Consumo', ids: ['dsr', 'dti', 'consumo-perdido', 'elasticidade', 'decomposicao-consumo'] },
      { modulo: '⚖️ Módulo C: Mínimo Existencial & Lei do Superendividamento (Lei 14.181/2021)', ids: ['minimo-existencial', 'margem-livre', 'teto-prudencial', 'parcela-quinquenal'] },
      { modulo: '📊 Módulo D: Dados Macroeconômicos & Programa Desenrola Brasil (2026)', ids: ['proporcao-macro', 'desenrola-desconto', 'desenrola-parcela', 'desenrola-economia'] }
    ];

    let html = '';

    listaIds.forEach(secao => {
      html += `
        <div class="space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
            <h4 class="font-bold text-sm text-urca-blue uppercase tracking-wide">${secao.modulo}</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      `;

      secao.ids.forEach(id => {
        const mem = obterMemoriaCalculo(id);
        html += `
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
            <div class="flex justify-between items-start gap-2">
              <span class="font-bold text-slate-800 text-xs">${mem.titulo}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Fórmula Geral:</span>
              <div class="math-formula-box text-[11px] whitespace-pre-wrap">${mem.formula}</div>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Substituição Atual do Aluno:</span>
              <div class="math-calc-step text-[11px] whitespace-pre-wrap">${mem.substituicao}</div>
            </div>
            <div class="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200/80 leading-relaxed">
              <strong class="text-emerald-700">Interpretação Didática:</strong> ${mem.interpretacao}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    cadernoFormulasConteudo.innerHTML = html;
    modalCadernoFormulas.classList.remove('hidden');
    lucide.createIcons();
  }

  if (btnAbrirCadernoFormulas) {
    btnAbrirCadernoFormulas.addEventListener('click', renderizarCadernoFormulas);
  }
  if (btnFecharCadernoFormulas) {
    btnFecharCadernoFormulas.addEventListener('click', () => modalCadernoFormulas.classList.add('hidden'));
  }
  if (btnFecharCadernoFormulasBottom) {
    btnFecharCadernoFormulasBottom.addEventListener('click', () => modalCadernoFormulas.classList.add('hidden'));
  }

  // Fecha modais com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharPopoverCalculo();
      modalGlossario.classList.add('hidden');
      modalLaudo.classList.add('hidden');
      if (modalCadernoFormulas) modalCadernoFormulas.classList.add('hidden');
    }
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

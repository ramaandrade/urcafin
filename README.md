# URCAFin — Simulador e Diagnóstico de Endividamento Pessoal

**Universidade Regional do Cariri (URCA)**  
*Centro de Estudos Sociais Aplicados · Departamento de Ciências Econômicas*  
**Público-Alvo:** Estudantes de graduação em Ciências Econômicas, Finanças e Administração.  
**Formato Tecnológico:** Single Page Application (SPA) Didática, 100% Local-First (Processamento Client-Side puro).  
**Acesso Online (GitHub Pages):** [https://ramaandrade.github.io/urcafin/](https://ramaandrade.github.io/urcafin/)

---

## 🌟 Visão Geral

O **URCAFin** é um laboratório interativo desenvolvido para aprofundar o aprendizado prático de alunas e alunos de Economia da URCA. A aplicação conecta conceitos teóricos seminais de Macroeconomia, Economia Comportamental, Psicologia Econômica e Direito do Consumidor a cenários empíricos reais do mercado financeiro brasileiro contemporâneo.

---

## 🏛️ Os Quatro Módulos Didáticos

### 📈 Módulo A: Painel Macroeconômico e o "Efeito Bola de Neve"
- **Simulador de Linhas de Crédito sob Juros Compostos:**
  - Confronto direto entre **Cartão de Crédito Rotativo (440,5% a.a. / 14,92% a.m.)**, **Cheque Especial (130,0% a.a. / 7,18% a.m.)**, **Crédito Consignado (24,8% a.a. / 1,87% a.m.)** e cenários customizados.
  - Cálculo exato do tempo para a dívida dobrar ($T_{dobro} = \frac{\ln(2)}{\ln(1+i)}$) e multiplicador do passivo.
  - Projeção temporal gráfica mês a mês via Chart.js.
- **Calculadora Econométrica de Impacto no Consumo (Crowding-out):**
  - Mensuração da razão Dívida/Renda ($DTI$) e comprometimento orçamentário mensal ($DSR\%$).
  - Decomposição setorial do consumo sacrificado: Alimentação essencial vs. Investimento em Capital Humano (Educação/Saúde) vs. Bens Duráveis e Lazer.
  - Estimativa da elasticidade-consumo ($\epsilon_{C, DTI}$) demonstrando o estrangulamento da propensão marginal a consumir.

### 📋 Módulo B: Questionário de Diagnóstico Epistemológico (10 Questões)
- Questionário de 10 perguntas fundamentadas nos principais pilares teóricos:
  1. *Uso de crédito para manter padrão de vida* → **Teoria do Ciclo de Vida (Franco Modigliani)**
  2. *Comprometimento da renda mensal (>30%)* → **Fragilidade Financeira e Posições Hedge/Ponzi (Hyman Minsky)**
  3. *Frequência de uso do rotativo/cheque especial* → **Desconto Hiperbólico e Viés do Presente (David Laibson)**
  4. *Conhecimento do Custo Efetivo Total (CET)* → **Teoria da Racionalidade Limitada e Heurísticas (Herbert Simon)**
  5. *Consumo impulsivo por fatores emocionais* → **Economia Comportamental & Contabilidade Mental (Richard Thaler / Daniel Kahneman)**
  6. *Sobrecarga cognitiva e perda de sono* → **Psicologia Econômica & Teoria da Escassez (Mullainathan & Shafir)**
  7. *Rolagem de dívidas com novos empréstimos* → **Dinâmica do Efeito Bola de Neve e Ilusão de Liquidez**
  8. *Atraso superior a 30 dias e negativação* → **Economia do Consumidor: Endividamento vs. Inadimplência (Peic/CNC)**
  9. *Pressão social de pares e status* → **Teoria do Consumo Conspícuo & Comparação Social (Thorstein Veblen / Leon Festinger)**
  10. *Reserva de emergência* → **Teoria Keynesiana da Demanda por Moeda por Motivo Precaução**
- **Resultado do Diagnóstico:**
  - Velocímetro / Gauge de Vulnerabilidade (0 a 100).
  - Categorização: *Solvência Estrutural*, *Vulnerabilidade Intermediária*, *Fragilidade Financeira* ou *Superendividamento Crítico*.
  - Matriz Teórica Detalhada questão a questão com diretrizes pedagógicas de intervenção.

### ⚖️ Módulo C: Calculadora do Mínimo Existencial (Lei 14.181/2021)
- Simulação da **Recuperação Judicial da Pessoa Física** sob o rito do Código de Defesa do Consumidor.
- Discriminação de despesas essenciais vitais (alimentação, energia/água, habitação, medicamentos e transporte).
- Comparação entre o piso infralegal do Decreto 11.567/2023 (R$ 600,00) e a subsistência real comprovada da família.
- Geração de **Plano Quinquenal de Repactuação (60 meses)** com suspensão de juros punitivos e respeito ao teto consignável de 30%.
- **Alerta de Solvência Acadêmico:** Identificação de casos de insolvência civil com recomendação de *haircut* (desconto forçado de principal) e carência de 180 dias (Art. 104-B).

### 📊 Módulo D: Painel de Mitos vs. Realidades Macroeconômicas & Desenrola 2026
- **Contraposição Empírica com Dados Reais:**
  - Juros pagos anualmente pelas famílias brasileiras: **R$ 696,8 bilhões / ano** (11,2% da renda).
  - Apostas online (*bets*): **R$ 37,0 bilhões / ano** (**apenas 0,46% do consumo familiar**).
  - Ensina ao estudante da URCA a distinguir correlações superficiais veiculadas pela mídia de causas causais primárias nos agregados macroeconômicos.
- **Simulador Interativo do Desenrola Brasil (2026):**
  - Aplicação de descontos de até 90% no principal.
  - Teto de juros de 1,99% ao mês para refinanciamento em até 60 meses.
  - Amortização com saldo inativo do FGTS.
  - Cláusula de proteção: Bloqueio preventivo do CPF para apostas online por 12 meses.

### 🎓 Dossiê / Laudo Acadêmico Individual
- Ferramenta nativa para emissão de laudo acadêmico contendo a síntese de todos os 4 módulos, com campos de identificação do aluno, matrícula, turma e área para assinatura e visto do professor.
- Totalmente otimizado para impressão limpa e salvamento direto em PDF (`@media print`).

---

## 🚀 Como Executar o Aplicativo

Como o URCAFin é **100% Local-First e Client-Side**, não requer compilação, NodeJS ou banco de dados configurado.

### Método 1: Abertura Direta no Navegador
Dê um duplo clique no arquivo `index.html` ou arraste-o para o Google Chrome, Edge, Firefox ou Safari.

### Método 2: Servidor Local via Terminal (PowerShell / Python)
No diretório `scratch/urcafin`:

```powershell
python -m http.server 8000
```

Em seguida, abra seu navegador em:  
👉 **http://localhost:8000**

---

## 📂 Estrutura de Arquivos

```
urcafin/
├── index.html                 # Estrutura SPA com navegação em abas e modais
├── css/
│   └── styles.css             # Estilos customizados, gauge, animações e @media print
├── js/
│   ├── data.js                # Base com dados macroeconômicos e as 10 questões teóricas
│   ├── macroSimulator.js      # Juros compostos, bola de neve e modelo econométrico de consumo
│   ├── diagnosticEngine.js    # Motor ponderado de diagnóstico e matriz epistemológica
│   ├── minimumExistential.js  # Calculadora da Lei 14.181/2021 e repactuação de 60 meses
│   ├── mythsAndData.js        # Dados comparativos Juros vs Bets e simulador Desenrola 2026
│   └── app.js                 # Gerenciamento de estado, eventos, Chart.js e laudo acadêmico
└── README.md                  # Documentação acadêmica e manual de utilização
```

---

## 📚 Referências Teóricas Utilizadas

1. **MODIGLIANI, Franco; BRUMBERG, Richard.** *Utility analysis and the consumption function: An interpretation of cross-section data*. 1954.
2. **SIMON, Herbert A.** *A behavioral model of rational choice*. The Quarterly Journal of Economics, 1955.
3. **KAHNEMAN, Daniel; TVERSKY, Amos.** *Prospect theory: An analysis of decision under risk*. Econometrica, 1979.
4. **THALER, Richard H.** *Mental accounting matters*. Journal of Behavioral Decision Making, 1999.
5. **MINSKY, Hyman P.** *The Financial Instability Hypothesis*. The Jerome Levy Economics Institute, 1992.
6. **MULLAINATHAN, Sendhil; SHAFIR, Eldar.** *Scarcity: Why having too little means so much*. Times Books, 2013.
7. **VEBLEN, Thorstein.** *The Theory of the Leisure Class*. Macmillan, 1899.
8. **BRASIL.** *Lei nº 14.181, de 1º de julho de 2021 (Lei do Superendividamento)*.
9. **BRASIL.** *Decreto nº 11.567, de 19 de junho de 2023 (Mínimo Existencial)*.
10. **CONFEDERAÇÃO NACIONAL DO COMÉRCIO (CNC).** *Pesquisa de Endividamento e Inadimplência do Consumidor (Peic)*, 2025/2026.

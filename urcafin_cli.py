#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
URCAFin — Protótipo Interativo em Python & Terminal CLI
Curso de Ciências Econômicas — Universidade Regional do Cariri (URCA)
Laboratório Didático de Finanças & Macroeconomia
"""

import sys
import math
import json
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# =============================================================================
# 1. PARÂMETROS MACROECONÔMICOS E BANCO DE DADOS TEÓRICO
# =============================================================================

MACRO_PARAMS = {
    "selic_anual": 14.50,
    "rotativo_anual": 440.50,
    "rotativo_mensal": 14.92,
    "cheque_anual": 130.00,
    "cheque_mensal": 7.18,
    "consignado_anual": 24.80,
    "consignado_mensal": 1.87,
    "familias_endividadas_peic": 80.9,
    "juros_familias_bilhoes": 696.8,
    "apostas_bets_bilhoes": 37.0,
    "minimo_existencial_decreto": 600.00
}

QUESTOES = [
    {
        "id": 1,
        "titulo": "1. Uso de Crédito para Manutenção do Padrão de Vida",
        "teoria": "Teoria do Ciclo de Vida (Modigliani)",
        "opcoes": [
            ("Nunca: o padrão de vida é estritamente ajustado à renda líquida disponível.", 0),
            ("Raramente: apenas em situações imprevistas pontuais de choque de liquidez.", 1),
            ("Frequentemente: todo final de mês é necessário complementar básicos com cartão.", 3),
            ("Sempre: salário já entra comprometido para pagar limite e novas dívidas são feitas.", 4)
        ]
    },
    {
        "id": 2,
        "titulo": "2. Comprometimento da Renda Mensal com Dívidas",
        "teoria": "Fragilidade Financeira e Solvência (Minsky)",
        "opcoes": [
            ("Até 10% da renda líquida familiar.", 0),
            ("Entre 11% e 30% da renda líquida (limite prudencial).", 1),
            ("Entre 31% e 50% da renda líquida (posição especulativa).", 3),
            ("Mais de 50% da renda mensal consumida por dívidas (posição Ponzi).", 4)
        ]
    },
    {
        "id": 3,
        "titulo": "3. Frequência de Uso do Rotativo e Cheque Especial",
        "teoria": "Crédito Comportamental & Viés do Presente (Laibson)",
        "opcoes": [
            ("Fatura sempre paga integralmente; cheque especial nunca usado.", 0),
            ("Pagou mínimo ou usou cheque especial 1 vez por imprevisto, já regularizado.", 1),
            ("Uso recorrente (2 a 4 vezes) do pagamento mínimo ou limite da conta.", 3),
            ("Rolagem contínua: saldo negativo há meses e faturas rotativas sucessivas.", 4)
        ]
    },
    {
        "id": 4,
        "titulo": "4. Conhecimento e Análise do Custo Efetivo Total (CET)",
        "teoria": "Teoria da Racionalidade Limitada (Herbert Simon)",
        "opcoes": [
            ("Calculo e comparo o CET anual (juros, IOF, tarifas e seguros) antes de assinar.", 0),
            ("Sei a taxa de juros nominal anunciada, mas nem sempre confiro o CET detalhado.", 1),
            ("Foco quase que exclusivamente em saber 'se a parcela cabe no bolso no fim do mês'.", 3),
            ("Não sei o que é CET e nunca verifiquei taxas dos contratos assinados.", 4)
        ]
    },
    {
        "id": 5,
        "titulo": "5. Consumo Impulsivo por Fatores Emocionais (Estresse/Tristeza)",
        "teoria": "Economia Comportamental & Contabilidade Mental (Thaler/Kahneman)",
        "opcoes": [
            ("Raramente ou nunca: compras seguem planejamento orçamentário prévio.", 0),
            ("Ocasionalmente em pequenos valores que não afetam o orçamento.", 1),
            ("Frequentemente compro para obter alívio emocional e desestresse.", 3),
            ("Compras impulsivas constantes seguidas de culpa e faturas impagáveis.", 4)
        ]
    },
    {
        "id": 6,
        "titulo": "6. Sobrecarga Cognitiva e Impactos no Bem-Estar Emocional",
        "teoria": "Psicologia Econômica & Escassez (Mullainathan & Shafir)",
        "opcoes": [
            ("Não afeta: finanças sob controle sem qualquer ansiedade.", 0),
            ("Preocupação leve passageira apenas em épocas de despesas sazonais.", 1),
            ("Afeta o sono com frequência e sinto desânimo/vergonha ao ver extrato.", 3),
            ("Preocupação debilitante constante: perda de foco total nos estudos e trabalho.", 4)
        ]
    },
    {
        "id": 7,
        "titulo": "7. Contratação de Empréstimos Sucessivos para Pagar Dívidas",
        "teoria": "Dinâmica do Efeito Bola de Neve & Ilusão de Liquidez",
        "opcoes": [
            ("Não: nunca paguei uma dívida contraindo outra nova.", 0),
            ("Fiz portabilidade planejada para linha com taxa substancialmente menor.", 0),
            ("Peguei empréstimo com juros similares ou maiores para cobrir atrasos.", 3),
            ("Ciclo contínuo de sobreposição de empréstimos em vários bancos.", 4)
        ]
    },
    {
        "id": 8,
        "titulo": "8. Atrasos de Contas e Restrições Cadastrais (Inadimplência)",
        "teoria": "Economia do Consumidor: Endividamento vs. Inadimplência (Peic)",
        "opcoes": [
            ("Nenhuma conta em atraso e sem qualquer restrição cadastral.", 0),
            ("Atrasos esporádicos operacionais de até 15 dias.", 1),
            ("Possuo 1 ou 2 contas atrasadas há mais de 30 dias ou negativação recente.", 3),
            ("Múltiplas dívidas negativadas e sensação de incapacidade de quitação.", 4)
        ]
    },
    {
        "id": 9,
        "titulo": "9. Pressão Social, Padrão dos Pares e Status de Consumo",
        "teoria": "Consumo Conspícuo & Comparação Social (Veblen / Festinger)",
        "opcoes": [
            ("Zero influência: escolhas balizadas 100% pela renda real e metas.", 0),
            ("Pequena influência em ocasiões sociais pontuais com limites claros.", 1),
            ("Frequentemente pressionado(a) a gastar para não se sentir excluído(a).", 3),
            ("Mantenho padrão artificial baseado em aparências e crédito rotativo.", 4)
        ]
    },
    {
        "id": 10,
        "titulo": "10. Reserva de Emergência e Gestão de Riscos",
        "teoria": "Teoria Keynesiana da Demanda por Moeda (Motivo Precaução)",
        "opcoes": [
            ("Por 6 meses ou mais em reserva de alta liquidez e baixo risco.", 0),
            ("Por 3 a 5 meses de custos essenciais.", 1),
            ("Por no máximo 1 mês: qualquer imprevisto já desestabiliza as contas.", 3),
            ("Nem um único dia: vivo no limite absoluto ou negativo sem poupança.", 4)
        ]
    }
]

# =============================================================================
# 2. CÁLCULOS DO EFEITO BOLA DE NEVE (MÓDULO A)
# =============================================================================

def simular_bola_de_neve(valor_inicial: float, meses: int = 12, amortizacao_mensal: float = 0.0):
    """
    Simula e compara o crescimento da dívida sob juros compostos
    """
    taxas = {
        "Rotativo (440,5% a.a.)": MACRO_PARAMS["rotativo_mensal"] / 100,
        "Cheque Especial (130,0% a.a.)": MACRO_PARAMS["cheque_mensal"] / 100,
        "Consignado (24,8% a.a.)": MACRO_PARAMS["consignado_mensal"] / 100
    }

    resultados = {}
    for nome, taxa in taxas.items():
        saldo = valor_inicial
        juros_totais = 0.0
        for _ in range(meses):
            juros = saldo * taxa
            juros_totais += juros
            pagamento = min(amortizacao_mensal, saldo + juros)
            saldo = saldo + juros - pagamento
            if saldo < 0.01:
                saldo = 0.0
                break
        
        tempo_dobro = math.log(2) / math.log(1 + taxa) if taxa > 0 else float('inf')
        mult = (saldo + (amortizacao_mensal * meses)) / valor_inicial if valor_inicial > 0 else 0
        
        resultados[nome] = {
            "saldo_final": round(saldo, 2),
            "juros_totais": round(juros_totais, 2),
            "multiplicador": round(mult, 2),
            "tempo_dobro_meses": round(tempo_dobro, 1)
        }

    return resultados

# =============================================================================
# 3. CÁLCULOS DO MÍNIMO EXISTENCIAL (MÓDULO C - LEI 14.181/2021)
# =============================================================================

def calcular_minimo_existencial(renda_liquida: float, divida_total: float, despesas: dict, prazo_meses: int = 60):
    """
    Calcula a partição de subsistência e gera o plano de repactuação voluntária
    """
    total_despesas_reais = sum(despesas.values())
    piso_decreto = MACRO_PARAMS["minimo_existencial_decreto"]
    minimo_existencial = max(piso_decreto, total_despesas_reais)
    
    margem_livre = max(0.0, renda_liquida - total_despesas_reais)
    teto_prudencial_30 = renda_liquida * 0.30
    capacidade_mensal = min(margem_livre, teto_prudencial_30)
    parcela_60 = divida_total / prazo_meses if prazo_meses > 0 else 0.0
    
    total_viavel_prazo = capacidade_mensal * prazo_meses
    deficit_divida = max(0.0, divida_total - total_viavel_prazo)
    haircut_pct = (deficit_divida / divida_total * 100) if divida_total > 0 else 0.0

    if renda_liquida <= total_despesas_reais:
        status = "INSOLVÊNCIA TOTAL (Déficit de Subsistência)"
        recomendacao = "Art. 104-B: Suspensão de cobranças, carência de 180 dias e assistência social."
    elif parcela_60 <= capacidade_mensal:
        status = "REPACTUAÇÃO PLENAMENTE VIÁVEL (Solvente em 5 Anos)"
        recomendacao = "Plano Voluntário Quinquenal viável. Quitação de 100% do principal sem juros punitivos."
    elif parcela_60 <= margem_livre:
        status = "ALERTA PRUDENCIAL: Asfixia Orçamentária (>30% da renda)"
        recomendacao = "Readequação do plano: alongamento de prazo para evitar violação do teto consignável."
    else:
        status = "SUPERENDIVIDAMENTO CRÍTICO: Necessidade de Haircut (Desconto Compulsório)"
        recomendacao = f"Plano Judicial Compulsório com desconto forçado de no mínimo {haircut_pct:.1f}% sobre os credores."

    return {
        "renda_liquida": renda_liquida,
        "total_despesas_reais": total_despesas_reais,
        "minimo_existencial": minimo_existencial,
        "margem_livre": margem_livre,
        "teto_prudencial_30": teto_prudencial_30,
        "capacidade_mensal": capacidade_mensal,
        "parcela_necessaria": round(parcela_60, 2),
        "status": status,
        "haircut_pct": round(haircut_pct, 1),
        "recomendacao": recomendacao
    }

# =============================================================================
# 4. INTERFACE INTERATIVA CLI (TERMINAL)
# =============================================================================

def imprimir_banner():
    print("=" * 75)
    print("       🏛️  URCAFin — Laboratório Didático de Finanças & Macroeconomia")
    print("    Universidade Regional do Cariri (URCA) · Curso de Ciências Econômicas")
    print("=" * 75)
    print(f" Cenário Macro: Selic {MACRO_PARAMS['selic_anual']}% a.a. | Rotativo {MACRO_PARAMS['rotativo_anual']}% a.a. | Peic {MACRO_PARAMS['familias_endividadas_peic']}%")
    print("-" * 75)

def executar_questionario_cli():
    print("\n📋 MÓDULO B: QUESTIONÁRIO DE DIAGNÓSTICO TEÓRICO (10 QUESTÕES)")
    print("Responda digitando o número da opção (1 a 4) para cada pergunta:\n")
    
    pontos_totais = 0
    respostas = []

    for q in QUESTOES:
        print(f"[{q['id']}/10] {q['titulo']}")
        print(f"Teoria Subjacente: {q['teoria']}")
        for i, (texto, pts) in enumerate(q["opcoes"], 1):
            print(f"   [{i}] {texto}")
        
        while True:
            try:
                escolha = int(input("   👉 Escolha (1-4): "))
                if 1 <= escolha <= 4:
                    pts_escolhidos = q["opcoes"][escolha - 1][1]
                    pontos_totais += pts_escolhidos
                    respostas.append((q["id"], escolha - 1, pts_escolhidos))
                    break
                print("   ⚠️ Entrada inválida. Digite 1, 2, 3 ou 4.")
            except ValueError:
                print("   ⚠️ Por favor, digite um número válido.")
        print()

    # Normalização 0 a 100
    indice = round((pontos_totais / 40) * 100)
    print("=" * 75)
    print("📊 RESULTADO DO DIAGNÓSTICO EPISTEMOLÓGICO:")
    print(f"Índice de Vulnerabilidade Financeira: {indice} / 100")

    if indice <= 25:
        perfil = "Solvência Estrutural e Equilíbrio Orçamentário"
        teoria = "Aderência plena à Teoria do Ciclo de Vida de Modigliani sem déficit primário."
    elif indice <= 50:
        perfil = "Vulnerabilidade Intermediária e Riscos Comportamentais"
        teoria = "Presença de viés do presente (Laibson) e contabilidade mental imperfeita (Thaler)."
    elif indice <= 75:
        perfil = "Fragilidade Financeira e Risco de Inadimplência"
        teoria = "Estrutura 'Especulativa' de Minsky: a renda não absorve choques de juros compostos."
    else:
        perfil = "Superendividamento Crítico e Asfixia Jurídica"
        teoria = "Estrutura 'Ponzi' de Minsky e sobrecarga cognitiva da escassez (Shafir). Caso de Lei 14.181/2021."

    print(f"Classificação: {perfil}")
    print(f"Fundamentação: {teoria}")
    print("=" * 75)

def executar_simulador_bola_neve_cli():
    print("\n📈 MÓDULO A: SIMULADOR DO EFEITO BOLA DE NEVE (JUROS COMPOSTOS)")
    try:
        valor = float(input("Digite o valor inicial da dívida em R$ [ex: 3000]: ") or "3000")
        meses = int(input("Digite o prazo da simulação em meses [ex: 12]: ") or "12")
        pagamento = float(input("Amortização mensal paga em R$ (0 para rolagem pura) [ex: 0]: ") or "0")
    except ValueError:
        valor, meses, pagamento = 3000.0, 12, 0.0

    print(f"\nSimulando R$ {valor:,.2f} ao longo de {meses} meses...")
    res = simular_bola_de_neve(valor, meses, pagamento)

    print("-" * 75)
    print(f"{'Modalidade':<32} | {'Saldo Final':<16} | {'Multiplicador':<12} | {'Dobra em'}")
    print("-" * 75)
    for linha, dados in res.items():
        print(f"{linha:<32} | R$ {dados['saldo_final']:<13,.2f} | {dados['multiplicador']:<8}x    | {dados['tempo_dobro_meses']} meses")
    print("-" * 75)
    print("💡 Didática URCA: Em 12 meses, o rotativo multiplica a dívida em mais de 5 vezes!")

def executar_minimo_existencial_cli():
    print("\n⚖️ MÓDULO C: CALCULADORA DO MÍNIMO EXISTENCIAL (LEI 14.181/2021)")
    try:
        renda = float(input("Renda líquida familiar mensal (R$) [ex: 2800]: ") or "2800")
        divida = float(input("Montante total de dívidas a repactuar (R$) [ex: 18000]: ") or "18000")
        alim = float(input("Gasto com alimentação básica (R$) [ex: 950]: ") or "950")
        agua_luz = float(input("Gasto com água/luz/energia (R$) [ex: 380]: ") or "380")
        moradia = float(input("Gasto com habitação/aluguel (R$) [ex: 600]: ") or "600")
        saude = float(input("Gasto com saúde/remédios (R$) [ex: 220]: ") or "220")
        transporte = float(input("Gasto com transporte essencial (R$) [ex: 180]: ") or "180")
        outros = float(input("Outros itens vitais (R$) [ex: 70]: ") or "70")
    except ValueError:
        renda, divida = 2800.0, 18000.0
        alim, agua_luz, moradia, saude, transporte, outros = 950.0, 380.0, 600.0, 220.0, 180.0, 70.0

    despesas = {
        "alimentacao": alim,
        "agua_luz": agua_luz,
        "moradia": moradia,
        "saude": saude,
        "transporte": transporte,
        "outros": outros
    }

    res = calcular_minimo_existencial(renda, divida, despesas, prazo_meses=60)

    print("-" * 75)
    print("DIAGNÓSTICO DA REPACTUAÇÃO QUINQUENAL (60 MESES):")
    print(f"• Total de Despesas Vitais Comprovadas: R$ {res['total_despesas_reais']:,.2f}")
    print(f"• Mínimo Existencial Intocável: R$ {res['minimo_existencial']:,.2f}")
    print(f"• Margem Livre Disponível para Credores: R$ {res['margem_livre']:,.2f}")
    print(f"• Teto Prudencial Consignável (30%): R$ {res['teto_prudencial_30']:,.2f}")
    print(f"• Parcela Mensal Necessária em 60x: R$ {res['parcela_necessaria']:,.2f}")
    print(f"• Status de Solvência: {res['status']}")
    print(f"• Parecer Processual: {res['recomendacao']}")
    print("-" * 75)

def executar_comparativo_macro_cli():
    print("\n📊 MÓDULO D: MITOS VS. REALIDADES MACROECONÔMICAS")
    print(f"• Juros anuais pagos pelas famílias no Brasil: R$ {MACRO_PARAMS['juros_familias_bilhoes']} BILHÕES")
    print(f"• Desembolso com apostas online (bets):        R$ {MACRO_PARAMS['apostas_bets_bilhoes']} BILHÕES (apenas 0,46% do consumo)")
    razao = MACRO_PARAMS['juros_familias_bilhoes'] / MACRO_PARAMS['apostas_bets_bilhoes']
    print(f"• Desproporção Empírica: O pagamento de JUROS é {razao:.1f} VEZES MAIOR do que os gastos em apostas!")
    print("\nConclusão para os estudantes da URCA: A asfixia do orçamento familiar brasileiro")
    print("decorre primariamente da Selic elevada, dos spreads bancários e dos juros do rotativo,")
    print("e não de desvios comportamentais residuais como as apostas.")
    print("-" * 75)

def executar_caderno_calculos_cli():
    print("\n📐 CADERNO DE CÁLCULOS & FÓRMULAS ECONÔMICAS (URCA)")
    print("=" * 75)
    print("1. JUROS COMPOSTOS (Efeito Bola de Neve):")
    print("   Fórmula: M = PV * (1 + i)^n")
    print("   Tempo de Dobra: T_dobro = ln(2) / ln(1 + i)")
    print("   Rotativo (14,92% a.m.): R$ 3.000 em 12m vira R$ 15.917,27 (dobra em 5 meses)")
    print("   Consignado (1,87% a.m.): R$ 3.000 em 12m vira R$ 3.746,94 (dobra em 37,4 meses)")
    print("-" * 75)
    print("2. COMPROMETIMENTO DA RENDA (DSR - Debt Service Ratio):")
    print("   Fórmula: DSR = (Serviço Mensal da Dívida / Renda Líquida Mensal) * 100")
    print("   Teto prudencial recomendado: 30%. Acima de 30% = Posição Especulativa (Minsky)")
    print("-" * 75)
    print("3. RAZÃO DÍVIDA/RENDA (DTI - Debt-to-Income):")
    print("   Fórmula: DTI_anos = Dívida Total / (Renda Mensal * 12)")
    print("   DTI_meses = Dívida Total / Renda Mensal")
    print("-" * 75)
    print("4. EFEITO CROWDING-OUT (Consumo Sacrificado):")
    print("   Fórmula: ΔC = Serviço da Dívida * PMC  [com PMC = 0,82]")
    print("   Decomposição: 28% Alimentação | 42% Capital Humano | 30% Duráveis/Lazer")
    print("-" * 75)
    print("5. ELASTICIDADE CONSUMO-DÍVIDA:")
    print("   Fórmula: ε_{C, DTI} = -(0,25 + 0,008 * DSR)")
    print("-" * 75)
    print("6. MÍNIMO EXISTENCIAL (Lei 14.181/2021):")
    print("   Fórmula: Mínimo = max(R$ 600,00, Σ Despesas Essenciais Comprovadas)")
    print("   Margem Livre = max(0, Renda - Mínimo Existencial)")
    print("   Parcela 60x = Dívida / 60 (com congelamento de encargos moratórios)")
    print("=" * 75)

def main():
    imprimir_banner()
    while True:
        print("\nMENU PRINCIPAL (URCAFin CLI):")
        print(" [1] Executar Questionário Teórico de Diagnóstico (10 Perguntas)")
        print(" [2] Simular Efeito Bola de Neve (Rotativo vs Cheque vs Consignado)")
        print(" [3] Calcular Mínimo Existencial & Repactuação Judicial (Lei 14.181)")
        print(" [4] Visualizar Análise Macro: Juros das Famílias vs Bets")
        print(" [5] Exibir Caderno de Cálculos & Fórmulas (URCA)")
        print(" [6] Sair")
        
        opcao = input("\n👉 Escolha uma opção (1-6): ").strip()
        if opcao == "1":
            executar_questionario_cli()
        elif opcao == "2":
            executar_simulador_bola_neve_cli()
        elif opcao == "3":
            executar_minimo_existencial_cli()
        elif opcao == "4":
            executar_comparativo_macro_cli()
        elif opcao == "5":
            executar_caderno_calculos_cli()
        elif opcao == "6":
            print("\nObrigado por utilizar o URCAFin! Bons estudos na URCA.")
            break
        else:
            print("⚠️ Opção inválida. Digite de 1 a 6.")

if __name__ == "__main__":
    main()

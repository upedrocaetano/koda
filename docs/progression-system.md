# Koda — Sistema de Progressão

**Versão:** 1.0
**Data:** 29 de março de 2026
**Status:** Draft

---

## Filosofia

O Koda NÃO aceita "entendi" como progresso.
O aluno precisa DEMONSTRAR que aprendeu através de 3 portões.

---

## 3 Portões por Conceito

### Portão 1: Compreensão
- Koda explica o conceito com analogia e exemplo
- Koda pede: "Me explica com suas palavras: o que acontece quando..."
- Claude avalia a resposta com critérios pré-definidos
- APROVADO: mencionou os pontos-chave com suas próprias palavras
- PARCIAL: elogia o que acertou, corrige o que faltou
- NÃO COMPREENDEU: re-explica com analogia diferente

### Portão 2: Prática
- Exercício de código com critérios de validação
- Claude compara com solução esperada
- Até 3 tentativas com feedback progressivo
- Se não conseguir em 3x: mostra solução e marca "completou com ajuda"

### Portão 3: Aplicação
- Mini-desafio que combina conceito novo + anteriores
- Força o aluno a pensar, não copiar
- Claude avalia criatividade + correção

---

## Níveis de Domínio

| Nível | Emoji | Significado |
|-------|-------|-------------|
| learning | 🔴 | Ainda não passou o portão 1 |
| practiced | 🟡 | Passou portões 1 e 2 |
| mastered | 🟢 | Passou todos os 3 portões |
| reviewed | ⭐ | Revisou após 7+ dias e lembrava |

---

## Regras de Progressão

1. Só avança pro próximo conceito se o atual está "practiced" ou "mastered"
2. Só avança pro próximo MÓDULO se 80% dos conceitos estão "mastered"
3. Se volta após 7+ dias: revisão relâmpago antes de avançar
4. Spaced repetition: conceitos "practiced" reaparecem como aquecimento
5. Se erra 3x o mesmo conceito: muda abordagem (analogia diferente)

---

## Tracking no Banco (tabela: progress)

```sql
- user_id
- module_id
- concept_id
- gate_1_status: "passed" | "retry" | "pending"
- gate_1_attempts: integer
- gate_2_status: "passed" | "passed_with_help" | "retry" | "pending"
- gate_2_attempts: integer
- gate_2_code: text (último código submetido)
- gate_3_status: "passed" | "skipped" | "pending"
- gate_3_attempts: integer
- mastery_level: "learning" | "practiced" | "mastered" | "reviewed"
- completed_at: timestamp
- time_spent_seconds: integer
```

---

## Visualização de Progresso

Quando aluno pede progresso, Koda retorna:

```
📊 Seu progresso no módulo JavaScript:

⭐ Variáveis (revisado!)
🟢 Tipos de dados (dominado)
🟢 Condicionais (dominado)
🟡 Loops (praticou, falta o desafio)
🔴 Funções (próximo!)
⬜ Arrays
⬜ Objetos

📈 4 de 7 conceitos completados (57%)
🔥 Streak: 5 dias seguidos!
```

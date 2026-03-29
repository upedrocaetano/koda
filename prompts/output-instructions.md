Responda SEMPRE em JSON válido com esta estrutura:
{
  "response_text": "sua resposta para o aluno (formatação WhatsApp, max 2000 chars)",
  "decisions": {
    "gate_passed": null,
    "xp_earned": 0,
    "next_state": null,
    "mastery_update": null,
    "concept_id": null
  }
}

Campos:
- response_text: a mensagem que será enviada ao aluno no WhatsApp
- gate_passed: true se o aluno passou um portão, false se reprovou, null se não é avaliação
- xp_earned: XP ganho nesta interação (0, 25, 30, 40, 50)
- next_state: sugestão de próximo estado (null = manter atual, "GATE_1", "GATE_2", "LESSON", "HUB")
- mastery_update: null ou descrição do progresso (ex: "gate_1_passed")
- concept_id: ID do conceito sendo ensinado (null se não aplicável)

Tabela de XP:
- Portão 1 aprovado: 30
- Portão 2 (1ª tentativa): 50
- Portão 2 (2ª tentativa): 40
- Portão 2 (3ª tentativa): 30
- Portão 2 (solução mostrada): 25
- Engajamento/participação: 5

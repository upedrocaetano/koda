# Koda — Visão de Produto

**Versão:** 2.0
**Data:** 29 de março de 2026
**Status:** Refinado — pós-brainstorm com founder

---

## One-liner

Professor de programação por IA que ensina do zero ao SaaS,
acessível via WhatsApp e Web, desenhado para cérebros inquietos (TDAH-friendly).

---

## Princípios de Design

### 1. Micro-sessões (3-5 min)
- Nunca exige mais de 5 minutos de atenção contínua
- Aluno pode parar a qualquer momento sem perder progresso
- Ideal para: ônibus, intervalo, antes de dormir

### 2. Formatos que variam
- Nunca o mesmo padrão duas vezes seguidas
- Formatos disponíveis:
  - 🎯 Quiz relâmpago (30s por pergunta)
  - 💻 Desafio de código (escreve e submete)
  - 🎮 "Ache o bug" (puzzle de debugging)
  - 🧩 Quebra-cabeça lógico (ordene as linhas)
  - 🏆 Boss fight (junta 3+ conceitos)
  - 🎲 Revisão aleatória
  - 📸 "O que esse código faz?" (leitura)
  - 🔥 Speed coding (resolva em 2 min)

### 3. Aluno escolhe
- Adapta ao humor/energia do dia
- Opções: "Tô focado" | "De boa" | "Quero jogar" | "Tenho dúvida"
- Autonomia = engajamento

### 4. Gamificação (dopamina-driven)
- 🔥 Streaks (dias seguidos)
- ⚡ XP por portão passado
- 🏆 Badges por conquistas
- 📈 Ranking pessoal (contra si mesmo)
- 🎰 Desafios surpresa ("loot box")
- 💎 Moedas Koda (ganha ao estudar)

### 5. Progressão real (3 portões)
- Portão 1: Compreensão (explica com suas palavras)
- Portão 2: Prática (escreve código)
- Portão 3: Aplicação (desafio combinado)
- Não aceita "entendi" — precisa demonstrar

### 6. TDAH-friendly
- Formatos curtos e variados
- Recompensa imediata a cada ação
- Pode parar e voltar sem culpa
- "Cansei" é resposta aceita
- Mapa visual (não lista)
- Surpresa e novidade constante

---

## Ecossistema Multi-canal

### WhatsApp (Evolution API)
- Chat com o professor IA
- Exercícios rápidos por texto
- Dúvidas a qualquer hora
- Áudio (perguntar/explicar por voz)
- Notificações e lembretes
- "Ache o bug" e quizzes

### Web App (Next.js)
- Dashboard visual do aluno
- Mapa do roadmap (visual tipo jogo, não lista)
- Code playground (roda código no browser)
- Badges e conquistas
- Streak e XP
- Histórico de código submetido
- Desafios visuais interativos

### Sincronização
- Estuda no WhatsApp → progresso aparece no web
- Vê dashboard no web → continua no WhatsApp
- Mesmo perfil, mesmo progresso, qualquer canal

---

## Mapa Visual do Roadmap

Em vez de lista de módulos, o aluno vê um mapa tipo jogo:

```
🏝️ Ilha HTML ──→ 🏔️ Monte CSS ──→ 🌋 Vulcão JavaScript
                                         │
                                    🏰 Castelo TypeScript
                                         │
                              🌊 Mar do Backend ──→ 🏗️ Cidade React
                                                        │
                                                   🚀 Base SaaS
                                                        │
                                                   🌟 LANÇAMENTO
```

Cada "ilha" tem fases. Aluno desbloqueia conforme avança.

---

## Diferencial Competitivo

| Mercado | Koda |
|---------|------|
| Vídeo de 2h | Sessão de 3 minutos |
| Mesmo formato sempre | Formato varia toda sessão |
| Lista de módulos | Mapa visual tipo jogo |
| "Assistiu" = progresso | 3 portões = progresso real |
| Só uma plataforma | WhatsApp + Web sincronizados |
| Passivo (assiste) | Ativo (responde, coda, explica) |
| Sem recompensa | XP, streaks, badges |
| Ritmo fixo | Adapta ao humor/energia do dia |
| Ignora neurodivergência | Desenhado para TDAH |

---

## Stack Técnica

- **WhatsApp:** Evolution API (self-hosted, VPS)
- **Backend:** Hono (TypeScript, mesma VPS)
- **Banco:** Supabase (externo)
- **IA:** Claude Sonnet (motor) + Haiku (classificador)
- **Web App:** Next.js (Vercel)
- **Áudio:** Whisper (transcrição)

---

## Público-alvo

### Primário
- 18-35 anos, Brasil
- Quer aprender programação para mudar de carreira ou criar SaaS
- Tem TDAH ou dificuldade de foco em formatos tradicionais
- Usa WhatsApp diariamente
- Prefere celular a computador
- Não tem paciência para vídeos longos

### Secundário
- Desenvolvedores iniciantes querendo chegar a fullstack
- Empreendedores querendo entender tech para criar produtos

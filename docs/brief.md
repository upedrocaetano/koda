# Project Brief: Koda — Professor de Programação via WhatsApp

**Versão:** 1.0
**Data:** 29 de março de 2026
**Autor:** Pedro Caetano
**Status:** Draft

---

## 1. Executive Summary

**Koda** é um assistente de IA que funciona como um professor particular de programação, acessível exclusivamente via WhatsApp. Ele ensina desde o zero (HTML, CSS, JavaScript, Python) até tópicos avançados (SaaS, APIs de IA), sem exigir que o aluno instale qualquer aplicação além do WhatsApp.

A proposta central é **democratizar o ensino de programação** usando o canal de comunicação mais popular do Brasil, removendo barreiras de tempo, localização e custo.

---

## 2. Problem Statement

### Cenário Atual
- **Cursos tradicionais** são longos, genéricos e têm alto índice de desistência (>70%)
- **Falta de direcionamento** — a maioria não sabe por onde começar ou qual caminho seguir
- **Dúvidas sem resposta** — problemas surgem na hora de praticar, fora do horário de aula
- **Barreiras altas** — plataformas exigem disciplina, tempo reservado e computador disponível
- **Falta de personalização** — não se adapta ao ritmo e ao contexto individual

### Dor Principal
O aprendiz precisa de um **professor disponível 24/7**, que:
- Responda dúvidas simples e complexas **ao seu ritmo**
- Proporcione **aprendizado personalizado**
- Esteja **onde ele já está** — no WhatsApp

### Contexto Brasil
- **130+ milhões de usuários ativos** no WhatsApp
- **Canal de menor fricção** — não precisa instalar app novo
- **Mercado emergente** para ensino tech sem plataforma complexa

---

## 3. Proposed Solution

Um **número de WhatsApp conectado a um agente de IA** (Claude via Anthropic) que funciona como professor particular de programação.

### Fluxo Básico
1. Aluno salva o número e manda "Oi"
2. Professor IA faz onboarding (objetivo, nível, tempo disponível)
3. Monta um roadmap personalizado
4. Ciclo de aulas: explicação → exemplo → exercício → correção → próximo passo
5. Memória de contexto permite retomar de onde parou

### Diferenciais
| Diferencial | Descrição |
|---|---|
| **24/7 disponível** | Responde imediatamente, qualquer hora |
| **Personalizado** | Adapta nível e ritmo a cada aluno |
| **Prático** | Envia exercícios, corrige código, explica erros |
| **Zero fricção** | WhatsApp, sem instalar nada |
| **Memória contextual** | Lembra progresso e pode retomar sessões |

### Por Que Isso Funciona
- Reduz fricção (está no app que o brasileiro já usa)
- Cria hábito (notificações, aprendizado diário)
- Escalável (IA não tem limite de alunos)
- Custo viável (APIs de IA + WhatsApp Business)

---

## 4. Target Users

### Perfil Primário: Carreira Switcher
**Quem são:**
- Idade: 18–35 anos
- Situação: Desempregado, subempregado ou em carreira insatisfatória
- Objetivo: Aprender programação para **mudar de carreira** ou criar produto digital próprio
- Nível técnico: Iniciante (zero experiência)
- Comportamento: Usa WhatsApp diariamente, prefere aprender no celular, não tem tempo para cursos longos

**Dor:**
- "Quero aprender programação, mas não consigo começar sozinho"
- "Tenho dúvidas, mas não tenho ninguém pra perguntar"
- "Cursos de plataforma são chatos — desisto rápido"

**Gain:**
- Aprender no seu ritmo, sem pressão
- Ter alguém respondendo suas dúvidas 24/7
- Construir um roadmap claro até conseguir um emprego ou lançar um produto

---

### Perfil Secundário: Gestor/Empreendedor
**Quem são:**
- Idade: 30–50 anos
- Situação: Empreendedor, gestor técnico ou líder de produto
- Objetivo: **Entender tecnologia** para tomar melhores decisões ou debugar ideias
- Nível técnico: Não-técnico a iniciante
- Comportamento: Ocupado, aprende em momentos curtos, precisa de respostas rápidas

**Dor:**
- "Meu time fala tecnologia e eu não entendo"
- "Quero validar uma ideia rápido, sem envolver engineiros"
- "Preciso aprender algo específico, não um curso inteiro"

**Gain:**
- Aprender apenas o que é relevante para seu negócio
- Comunicação mais eficaz com time técnico
- Autonomia para prototipagem rápida de ideias

---

## 5. Goals & Success Metrics

### Business Objectives
- Atingir **100 usuários ativos** no final de 6 meses
- Alcançar **taxa de retenção > 40%** após 7 dias (free trial)
- Converter **> 20%** dos free → pago (Plano Básico ou Pro)
- Manter **churn mensal < 10%** (retenção de pagos)
- Atingir **LTV:CAC > 3:1** (viabilidade financeira)

### User Success Metrics
- **Engajamento:** Média de **3+ sessões/semana** por aluno ativo
- **Aprendizado:** Taxa de conclusão de exercícios **> 60%**
- **Satisfação:** NPS > 50 (Net Promoter Score)
- **Tempo de sessão:** Média de **15+ minutos** por interação

### Key Performance Indicators
- **Retention Day 1:** > 80% (continua usando)
- **Retention Day 7:** > 40% (ponto crítico — free trial)
- **Retention Day 30:** > 25% (viabilidade de pago)
- **Exercise Completion Rate:** > 60% (proxy para aprendizado)
- **Conversation Length:** Média de 5+ trocas por sessão
- **Conversion Rate (Free → Paid):** > 20%
- **Customer Acquisition Cost:** < R$ 30 por aluno
- **Lifetime Value:** > R$ 150 (mínimo viável)

---

## 6. MVP Scope

### Core Features (Deve Ter)

#### 1. Onboarding Inteligente ⭐ **Alta Prioridade**
- Professor IA pergunta: objetivo, nível atual, tempo disponível/dia
- Constrói roadmap personalizado (ex: "10 semanas de HTML/CSS até seu primeiro site")
- Armazena perfil no Supabase

#### 2. Aulas Conversacionais ⭐ **Alta Prioridade**
- Professor explica conceitos em passos pequenos
- Usa analogias simples e exemplos práticos
- Adapta linguagem ao nível do aluno
- Pode fazer perguntas para testar compreensão

#### 3. Exercícios Práticos ⭐ **Alta Prioridade**
- Professor envia desafios de código
- Aluno responde por texto (cola código na mensagem)
- Professor avalia e explica erros linha a linha

#### 4. Correção de Código ⭐ **Alta Prioridade**
- Aluno envia código (por mensagem ou foto)
- Professor identifica bugs, explica raiz do problema
- Sugere melhorias (performance, limpeza, etc)

#### 5. Modo Dúvida Rápida ⭐ **Alta Prioridade**
- Aluno pergunta qualquer coisa sobre programação
- Fora da estrutura de aula, mas respeitando o contexto
- Exemplo: "Como faço um loop em Python?" → resposta direta

#### 6. Memória de Contexto ⭐ **Alta Prioridade**
- Professor lembra onde o aluno parou
- Recupera histórico de aulas anteriores (via Supabase)
- Usa embeddings para encontrar sessões relevantes
- Retoma com: "Vimos que você já entende loops. Vamos para funções?"

#### 7. Visualização de Progresso 🟡 **Média Prioridade**
- Aluno pode pedir um resumo: "Como vou no meu roadmap?"
- Professor retorna: "Completou 3/10 semanas. Próximo: Arrays"

### Out of Scope — V1
- ❌ App nativo ou plataforma web (apenas WhatsApp)
- ❌ Vídeo-aulas ou conteúdo gravado
- ❌ Certificados ou diplomas
- ❌ Integração com IDEs (Replit, CodePen, etc)
- ❌ Suporte a outras linguagens além de HTML, CSS, JavaScript, Python
- ❌ Modo grupo (só 1-to-1 na V1)
- ❌ Gamificação (points, badges, leaderboards)

### MVP Success Criteria
O MVP é um sucesso quando:
1. **5 beta users** completam 3 semanas de estudo
2. **Retenção > 40%** no período free (7 dias)
3. **Pelo menos 1 user** converte para pago
4. **NPS > 40** (ao menos "passável")
5. **Feedback qualitativo** indica que o professor resolveu a dor (dúvidas respondidas, aprendizado real)

---

## 7. Post-MVP Vision

### Phase 2: Expansão de Alcance (Semanas 12–20)
- **Painel do professor:** Dashboard web para monitora múltiplos alunos
- **Plano Turma:** Colegios/bootcamps usam Koda com seus alunos
- **Resumos automáticos:** Gera PDFs das aulas semanalmente
- **Recomendações de recursos:** Links para docs, vídeos, ferramentas
- **Notificações:** Lembretes configuráveis ("Estude 30 min hoje?")

### Phase 3: Monetização Completa (Semanas 20–32)
- **Checkout integrado:** Stripe/PagSeguro dentro do WhatsApp
- **Plano Empresarial:** Venda para escolas de programação, bootcamps
- **Trilhas especializadas:** "SaaS Builder", "Freelancer Pro", etc
- **Mentoria 1-to-1 humana:** Upgrade para sessões com dev real (premium)

### Long-term Vision (6–12 meses)
**Koda como plataforma de educação tech no Brasil:**
- 10k alunos ativos
- Múltiplas trilhas (frontend, backend, full-stack, mobile, data)
- Comunidade de alunos (grupos no Telegram)
- Parcerias com empresas para job placement
- Faturamento mensal > R$ 50k

### Expansion Opportunities
- Expandir para TikTok (shorts educacionais)
- Vender dados de aprendizado anonimizados para plataformas
- Criar marketplace de "desafios de código" de empresas reais
- Parceria com universidades (complemento à educação formal)

---

## 8. Technical Considerations

### Platform Requirements
- **Plataforma alvo:** WhatsApp Business (Brasil, depois LATAM)
- **Suporte:** iOS + Android (via WhatsApp)
- **Performance:** Resposta < 3s (máximo aceitável)
- **Disponibilidade:** 99.5% uptime mínimo

### Technology Preferences
- **Canal:** WhatsApp Business API (via Twilio ou Z-API)
- **LLM:** Claude (Anthropic) — melhor para educação
- **Backend:** Node.js + Express (ou Python + FastAPI)
- **Banco:** Supabase (PostgreSQL) — armazena alunos, sessões, progresso
- **Memória contextual:** Embeddings via Supabase pgvector + OpenAI embeddings
- **Deploy:** Railway ou Render (serverless, fácil scaling)
- **Monitoramento:** Logs no Supabase + Sentry (erros em produção)

### Architecture Considerations
- **Monorepo:** Backend (API) + Scripts utilitários
- **Service architecture:** Serverless functions para webhooks WhatsApp
- **Integrações:** Anthropic API → Supabase → WhatsApp API
- **Segurança:** HTTPS, tokens JWT, rate limiting, validação de webhooks
- **RLS (Row-Level Security):** Cada aluno vê apenas suas próprias sessões no Supabase

---

## 9. Constraints & Assumptions

### Constraints
| Constraint | Descrição |
|---|---|
| **Budget** | Bootstrap (sem investimento externo) — API costs < R$ 2k/mês inicialmente |
| **Timeline MVP** | 8 semanas até beta com 5 usuários |
| **Resources** | Pessoa (Pedro) — code + product + growth (até achar CO-founder técnico) |
| **WhatsApp API** | Restrições de rate-limiting e aprovação de conta business |
| **LLM Costs** | Necessário otimizar prompts para manter custo/aluno baixo |

### Key Assumptions
- WhatsApp é o canal ideal para o público-alvo (validar com entrevistas)
- Alunos preferem aprender no celular a abrir computador
- Uma IA consegue ensinar programação tão bem quanto um humano iniciante
- Taxa de conversão free → pago será > 20% (baseado em benchmarks de educação online)
- Alunos pagam quando veem progresso real (métrica: conclusão de exercícios)
- Python + JavaScript são suficientes para V1 (expandir depois)
- Memória contextual via embeddings é viável e barata

---

## 10. Risks & Open Questions

### Key Risks

| Risk | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Qualidade das respostas de IA** | Alta | Alto | Teste extensivo com 5 beta users, feedback loops, prompt engineering |
| **Custo de API inviável** | Média | Alto | Otimizar prompts, cache de respostas comuns, considerar modelo menor (Claude Haiku) |
| **Limitações da WhatsApp API** | Média | Médio | Início com Twilio (mais permissivo), depois Z-API (melhor rate) |
| **Baixo engajamento após semana 2** | Alta | Alto | Notificações, gamificação leve, design conversacional envolvente |
| **Competição (Alura, Rocketseat)** | Alta | Médio | Diferencial: WhatsApp + 24/7 + personalizado, não compete direto |
| **Escalabilidade de memória** | Baixa | Médio | Começa simples (histórico), depois adiciona embeddings se tiver $ |

### Open Questions
- Como o aluno prefere submeter código? (texto, foto, pastebin?)
- Qual o tempo ideal entre exercício e feedback para manter engajamento?
- Qual o melhor horário para notificações de estudo?
- Quanto o aluno está disposto a pagar? (R$ 49 vs R$ 97 vs outro?)
- Qual linguagem começar? (HTML/CSS mais acessível, JavaScript mais procurado?)
- Como medir se o aluno aprendeu realmente (vs apenas completou exercício)?

### Areas Needing Further Research
- Entrevistas com 10+ pessoas do target para validar dor + channel fit
- Análise de competitors (Alura, Udemy, MasterClass, Magic School, etc)
- Benchmarks de custo de APIs (Claude vs GPT-4 vs Mixtral)
- Estudo de retenção em educação online (o que mantém aluno voltando?)
- Validação de precificação (5 pessoas testam 3 planos diferentes)

---

## 11. Research Summary

### Market Opportunity
- **Brasil:** 130M+ de WhatsApp users, crescimento de edtech 2x/ano
- **Educação técnica:** Demanda por bootcamps cresceu 300% em 5 anos (falta de supply)
- **Modelo conversacional:** ChatGPT provou que pessoas querem aprender by chat
- **Pricing:** Bootcamp custa R$ 5–10k, online custa R$ 49–497/mês → mercado de R$ 1B+

### Early Insights (de seu conhecimento)
- Pessoas preferem aprender no WhatsApp a plataformas web
- Video-aulas têm dropout > 90% (textual é mais prático)
- Feedback rápido é crítico para manter motivação
- Exercícios > teoria (learning by doing)

---

## 12. Next Steps

### Immediate Actions (Próxima Semana)
1. ✅ **Validação:** Entrevista 10 pessoas do target (perguntar se usaria, quanto pagariam)
2. ✅ **MVP Planning:** Definir escopo exato dos 5 features core para V1
3. ✅ **Tech Setup:** Boilerplate backend (Node + Supabase)
4. ✅ **Prompt Design:** Draftar prompt do professor IA (tom, estrutura, exemplos)

### Development Phase (Semanas 1–8)
1. Setup WhatsApp API + Backend
2. Integração com Claude API
3. Supabase schema (users, sessions, exercises, progress)
4. Embed system (opcional na V1, só histórico simples)
5. Onboarding flow
6. Aula + exercício flow
7. Testes internos (Pedro mesmo testa 2 semanas)

### Beta Launch (Semana 8–9)
1. Recrutar 5 beta testers (do seu network)
2. Orientação: use por 7 dias, feedback em Typeform
3. Iterar com feedback (bugs, tom, dificuldade)
4. Preparar para público (selecionado, sem divulgação)

### Go/No-Go Decision (Semana 10)
- **Go:** Se Retention D7 > 40% + NPS > 40, abrir para 20 pagos
- **No-Go:** Pivotar (talvez add web, talvez mudar LLM)

### PM Handoff
Este Project Brief fornece o contexto completo do **Koda**. Próximo passo é criar a **PRD (Product Requirements Document)**, que detalha:
- Cada feature descrita aqui com acceptance criteria
- User flows completos
- Epic list (sequência de desenvolvimento)
- Dependências técnicas

---

## Metadata
- **Versão:** 1.0 (Draft)
- **Status:** Pronto para refinamento
- **Próximo:** Criar PRD baseado neste brief
- **Última atualização:** 29 de março de 2026

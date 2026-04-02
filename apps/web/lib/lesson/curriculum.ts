// Currículo em memória — Módulo 1: Lógica de Programação
// Reutiliza a mesma estrutura do backend (src/modules/lesson/handler.ts)

export interface ConceptData {
  id: string
  name: string
  moduleName: string
  moduleId: number
  analogy: string
  key_points: string[]
  exercise: string
  solution: string
}

export const CURRICULUM: Record<string, ConceptData> = {
  variaveis: {
    id: 'variaveis',
    name: 'Variáveis',
    moduleName: 'Lógica de Programação',
    moduleId: 1,
    analogy: 'Variável é como uma caixa com etiqueta — você dá um nome e guarda algo dentro',
    key_points: [
      'Variável guarda um valor na memória',
      'Tem um nome (identificador) que você escolhe',
      'O valor pode mudar (por isso "variável")',
      'Em JavaScript: let nome = "Pedro"',
    ],
    exercise: 'Crie uma variável chamada `nome` com seu nome e outra chamada `idade` com sua idade',
    solution: "let nome = 'Pedro'\nlet idade = 25",
  },
  'tipos-de-dados': {
    id: 'tipos-de-dados',
    name: 'Tipos de Dados',
    moduleName: 'Lógica de Programação',
    moduleId: 1,
    analogy: 'Tipos são como categorias de produtos no mercado — cada prateleira tem seu tipo',
    key_points: [
      'String = texto, sempre entre aspas',
      'Number = números, sem aspas',
      'Boolean = verdadeiro ou falso (true/false)',
      'JavaScript escolhe o tipo automaticamente',
    ],
    exercise: 'Crie 3 variáveis: uma string com seu nome, um number com sua idade, e um boolean dizendo se gosta de café',
    solution: "let nome = 'Pedro'\nlet idade = 25\nlet gostaDeCafe = true",
  },
  condicionais: {
    id: 'condicionais',
    name: 'Condicionais',
    moduleName: 'Lógica de Programação',
    moduleId: 1,
    analogy: 'Condicional é como um semáforo — se verde, anda; se vermelho, para',
    key_points: [
      'if verifica uma condição (verdadeiro ou falso)',
      'Se true, executa o bloco dentro das chaves {}',
      'else é o "senão" — o que acontece se for false',
      'Pode encadear com else if para mais opções',
    ],
    exercise: 'Crie uma variável `hora` com um número. Se for maior que 18, mostre "Boa noite", senão mostre "Bom dia"',
    solution: "let hora = 20\nif (hora > 18) {\n  console.log('Boa noite')\n} else {\n  console.log('Bom dia')\n}",
  },
}

export const CONCEPT_ORDER = ['variaveis', 'tipos-de-dados', 'condicionais']

export function getCurrentConcept(context: Record<string, unknown>): string {
  return (context.currentConceptId as string) || CONCEPT_ORDER[0]
}

export function getNextConcept(currentId: string): string | null {
  const idx = CONCEPT_ORDER.indexOf(currentId)
  if (idx < 0 || idx >= CONCEPT_ORDER.length - 1) return null
  return CONCEPT_ORDER[idx + 1]
}

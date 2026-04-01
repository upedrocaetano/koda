export const prophecies = [
  'Não existe colher. Existe apenas o código.',
  'A Matrix é feita de loops e condicionais. Você está aprendendo a controlá-la.',
  'O que é real? O que você consegue codar, testar e deployar.',
  'Eu só posso te mostrar a porta. Quem escreve o código é você.',
  'Todo grande programador já foi um iniciante que não desistiu.',
  'Bugs são professores disfarçados. Cada erro é uma lição.',
  'Você não precisa ver o código inteiro. Só precisa dar o próximo passo.',
  'A diferença entre quem sabe e quem não sabe é a prática diária.',
  'O console.log é seu oráculo. Confie nele.',
  'Cada variável que você declara é um tijolo do seu futuro SaaS.',
  'A velocidade não importa. A direção importa. Continue codando.',
  'Errar 100 vezes e acertar na 101ª ainda é uma vitória.',
  'Seu streak é sua disciplina visível. Mantenha-o vivo.',
  'O código perfeito não existe. Código que funciona, sim.',
  'Você está mais perto do que imagina. Mais uma função e chega lá.',
  'A melhor hora para começar a codar foi ontem. A segunda melhor é agora.',
  'Debugar é como ser detetive num filme onde você também é o assassino.',
  'Toda aplicação complexa começou com um console.log("hello world").',
  'Seu cérebro é o melhor compilador. Alimente-o com prática.',
  'A persistência é o algoritmo mais poderoso que existe.',
  'Não compare seu capítulo 1 com o capítulo 20 de alguém.',
  'O Koda acredita em você. Agora é sua vez de acreditar também.',
  'Free your mind. O código vai fluir.',
  'Lembre-se: até o Neo precisou de treino antes de voar.',
]

export function getProphecyOfTheDay(): string {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return prophecies[dayOfYear % prophecies.length]
}

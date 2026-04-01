import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { message, userId } = await request.json()

  if (!message || !userId) {
    return NextResponse.json(
      { error: 'message and userId are required' },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()

  // Save user message
  await supabase.from('interactions').insert({
    user_id: userId,
    role: 'user',
    content: message,
  })

  // For now, return a placeholder response.
  // Story 2.6 will integrate the full AI pipeline from @koda/whatsapp.
  const response = generatePlaceholderResponse(message)

  // Save assistant response
  const { data: saved } = await supabase
    .from('interactions')
    .insert({
      user_id: userId,
      role: 'assistant',
      content: response,
    })
    .select('id')
    .single()

  return NextResponse.json({
    id: saved?.id,
    response,
  })
}

function generatePlaceholderResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('olá') || lower.includes('oi') || lower.includes('hey')) {
    return 'Olá! Sou o Koda, seu professor de programação. 🟢\n\nEstou aqui para te ajudar a aprender a programar do zero. O que você gostaria de aprender hoje?'
  }

  if (lower.includes('variável') || lower.includes('variavel')) {
    return '**Variáveis** são como caixas onde guardamos informações no código.\n\nEm JavaScript, podemos criar assim:\n\n```javascript\nlet nome = "Pedro"\nconst idade = 25\n```\n\n- `let` — valor pode mudar\n- `const` — valor fixo\n\nQuer praticar criando suas próprias variáveis?'
  }

  if (lower.includes('função') || lower.includes('funcao') || lower.includes('function')) {
    return '**Funções** são blocos de código reutilizáveis.\n\n```javascript\nfunction saudacao(nome) {\n  return `Olá, ${nome}!`\n}\n\nconsole.log(saudacao("Pedro"))\n// Olá, Pedro!\n```\n\nPense nelas como receitas: você define uma vez e usa quantas vezes quiser.'
  }

  return `Boa pergunta! Estou processando sua mensagem sobre "${message.slice(0, 50)}..."\n\n*A integração completa com a IA será implementada na Story 2.6. Por enquanto, estou em modo de demonstração.*\n\nTente perguntar sobre **variáveis** ou **funções** para ver exemplos!`
}

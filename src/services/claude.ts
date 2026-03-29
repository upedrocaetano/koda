// Cliente Anthropic (Claude) do Koda
// Usado para Sonnet (ensino) e Haiku (classificador de intenção)

import Anthropic from '@anthropic-ai/sdk'

let _claude: Anthropic | null = null

export function getClaude(): Anthropic {
  if (!_claude) {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error(
        'Variável ANTHROPIC_API_KEY é obrigatória. ' +
        'Verifique o arquivo .env'
      )
    }

    _claude = new Anthropic({ apiKey })
  }
  return _claude
}

// Re-export como getter lazy para compatibilidade
export const claude: Anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    return (getClaude() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

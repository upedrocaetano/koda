// Etapa 9 — Format & Send
// Formata resposta para WhatsApp e envia via Evolution API
// O sendMessage já lida com split de mensagens > 2000 chars

import { sendMessage } from '../../services/evolution.js'

export async function formatSend(phone: string, text: string): Promise<void> {
  // WhatsApp já suporta: *bold*, _italic_, ```code```, ~strikethrough~
  // O texto vindo do Claude já deve estar formatado corretamente
  // sendMessage já faz split em < 2000 chars

  await sendMessage(phone, text)
}

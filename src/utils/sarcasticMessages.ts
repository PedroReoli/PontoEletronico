// Tipos de mensagens
export type MessageType =
  | "ON_TIME"
  | "SLIGHTLY_LATE"
  | "VERY_LATE"
  | "VERY_EARLY"
  | "FORGOT"
  | "FIRST_PLACE"
  | "SECOND_PLACE"
  | "THIRD_PLACE"

// Mensagens para cada tipo
const messages: Record<MessageType, string[]> = {
  // 1. Ponto no horário
  ON_TIME: [
    "Uau, você chegou no horário! Quer uma medalha ou um biscoito?",
    "Olha só quem decidiu seguir o contrato de trabalho hoje!",
    "Pontualidade? Em 2025? Revolucionário!",
    "Parabéns por fazer o mínimo esperado! 👏",
    "Chegou no horário! Sua mãe deve estar orgulhosa.",
    "Pontual como um relógio suíço... de segunda mão.",
    "Nem atrasado, nem adiantado. Perfeitamente medíocre!",
    "Chegou no horário. O RH agradece por não ter que inventar desculpas pra diretoria.",
    "Pontualidade: a virtude dos entediados e dos que não têm Netflix.",
    "Chegou no horário! Já pode colocar isso no currículo como 'habilidade extraordinária'.",
  ],

  // 2. Atraso leve (1 a 10 minutos)
  SLIGHTLY_LATE: [
    "Só um pouquinho atrasado... o trânsito estava ruim no corredor da sua casa até o home office?",
    "Quase no horário! Quase...",
    "Atrasado o suficiente para ser notado, mas não o suficiente para ser demitido. Estratégico!",
    "Chegou atrasado, mas pelo menos chegou com estilo... ou não.",
    "Alguns minutos de atraso? Deve ser o novo conceito de 'horário flexível'.",
    "Atrasado porque o despertador não te respeitou hoje?",
    "Pequeno atraso. Grande drama para o seu gestor.",
    "Chegou atrasado. O café já esfriou, assim como o entusiasmo do seu chefe por você.",
    "Alguns minutos de atraso hoje, alguns fios de cabelo brancos a mais no seu gestor.",
    "Atrasado: porque ser pontual é mainstream demais para você.",
  ],

  // 3. Muito atraso (acima de 10 minutos)
  VERY_LATE: [
    "Bom dia! Ou seria boa tarde já?",
    "Uau, você realmente apareceu! Já estávamos organizando um grupo de busca.",
    "Atrasado assim só se você mora no fuso horário errado.",
    "Chegou tão tarde que o almoço já está quase pronto!",
    "Esse não é um atraso, é uma declaração de independência do relógio.",
    "Tão atrasado que até o café da manhã virou almoço.",
    "Chegou tão tarde que o pessoal já estava apostando se você tinha sido abduzido por aliens.",
    "Atrasado assim só se você veio andando... do Japão.",
    "Seu atraso é tão impressionante que merece entrar para o Guinness Book.",
    "Chegou tão tarde que o RH já tinha preparado os papéis da sua demissão por abandono.",
  ],

  // 4. Ponto muito cedo (antes do horário esperado)
  VERY_EARLY: [
    "Calma, nem o sol acordou ainda!",
    "Tão cedo? Você mora na empresa ou o quê?",
    "Chegou tão cedo que até os passarinhos ainda estão roncando.",
    "Madrugou, hein? Ansioso para ver a cara de sono dos colegas?",
    "Chegou tão cedo que confundiu o segurança do prédio.",
    "Tão cedo assim? Tem certeza que não é sonâmbulo?",
    "Chegou antes do horário. Suspeito que você está tentando impressionar alguém... ou fugindo de alguém?",
    "Tão cedo que até o café ainda não acordou.",
    "Chegou antes da hora. O que você está tramando?",
    "Madrugou! Ou será que nem dormiu? 🤔",
  ],

  // 5. Esqueceu de bater o ponto
  FORGOT: [
    "Esqueceu de bater o ponto ontem? Sua memória é tão boa quanto a minha vontade de trabalhar às segundas.",
    "Esqueceu o ponto? Também esqueceu que o RH existe?",
    "Não registrou o ponto? Que bom que o sistema não esquece de você como você esquece dele.",
    "Esqueceu de bater o ponto? Aposto que não esquece de receber o salário!",
    "Ponto não registrado. Sua existência na empresa está em questão.",
    "Esqueceu de bater o ponto? O RH mandou avisar que também pode 'esquecer' de processar seu pagamento.",
    "Não bateu o ponto? Vamos fingir que você estava em uma missão secreta.",
    "Esqueceu o ponto como esquece as reuniões chatas?",
    "Ponto não registrado. Você existe mesmo ou é um produto da nossa imaginação coletiva?",
    "Esqueceu de bater o ponto? Sua presença é tão marcante que ninguém notou mesmo...",
  ],

  // 6. Primeiro lugar no ranking da semana
  FIRST_PLACE: [
    "Primeiro lugar no ranking! Você ganha... absolutamente nada além deste aviso sarcástico!",
    "Parabéns, você é o funcionário mais pontual! Sua vida deve ser muito emocionante.",
    "Primeiro lugar! Sua dedicação à pontualidade é quase tão impressionante quanto seria ter uma vida social.",
    "Campeão de pontualidade! Isso vai ficar ótimo no seu obituário.",
    "Primeiro lugar! Você deve ser muito divertido em festas... se é que vai a alguma.",
    "Uau, primeiro lugar! Sua mãe deve estar orgulhosa. Nós estamos moderadamente impressionados.",
    "Campeão de pontualidade! Já pensou em colocar isso no Tinder?",
    "Primeiro lugar! Sua obsessão com horários é admirável e ligeiramente perturbadora.",
    "Parabéns pelo primeiro lugar! Seu prêmio é... mais trabalho!",
    "Campeão absoluto! Seu troféu está no mesmo lugar que suas horas extras não pagas.",
  ],

  // 7. Segundo lugar no ranking
  SECOND_PLACE: [
    "Segundo lugar! Quase lá! Quase...",
    "Prata na pontualidade! Isso é como ganhar um abraço do seu tio esquisito: ninguém realmente quer.",
    "Segundo lugar! Você é oficialmente o primeiro perdedor da pontualidade.",
    "Quase campeão! Mas 'quase' só conta em jogo de ferradura e granada.",
    "Segundo lugar! Tão perto da glória, tão longe do reconhecimento real.",
    "Prata na pontualidade! Pelo menos não é bronze, né?",
    "Segundo lugar! Como diria minha avó: 'Quase não enche barriga'.",
    "Parabéns pelo segundo lugar! Você é o vice-campeão do básico.",
    "Segundo lugar! Você é consistentemente o segundo melhor. Pense nisso.",
    "Prata na pontualidade! Isso vai ficar ótimo no seu currículo... não.",
  ],

  // 8. Terceiro lugar no ranking
  THIRD_PLACE: [
    "Terceiro lugar! Pelo menos você está no pódio... o pódio dos pontuais, mas ainda é um pódio!",
    "Bronze na pontualidade! Como se sentir medíocre com estilo.",
    "Terceiro lugar! Você se esforçou o suficiente para não ser ignorado, mas não o suficiente para impressionar.",
    "Parabéns pelo bronze! É como ganhar um 'menção honrosa' na feira de ciências da vida.",
    "Terceiro lugar! Você é oficialmente melhor que a maioria, mas pior que alguns. Pense nisso.",
    "Bronze! Pelo menos você não é o quarto lugar, esse nem mencionamos.",
    "Terceiro lugar na pontualidade! Sua mediocridade é consistente, pelo menos.",
    "Bronze! É como o ouro, só que mais marrom e menos valioso.",
    "Terceiro lugar! Você é o melhor... entre os piores dos melhores.",
    "Parabéns pelo bronze! É quase como ganhar, só que não.",
  ],
}

/**
 * Retorna uma mensagem sarcástica aleatória com base no tipo
 * @param type Tipo da mensagem
 * @returns Mensagem sarcástica
 */
export function getRandomMessage(type: MessageType): string {
  const messageList = messages[type]
  if (!messageList || messageList.length === 0) {
    return "Você bateu o ponto. Parabéns, eu acho?"
  }

  const randomIndex = Math.floor(Math.random() * messageList.length)
  return messageList[randomIndex]
}

/**
 * Retorna todas as mensagens de um determinado tipo
 * @param type Tipo da mensagem
 * @returns Array de mensagens
 */
export function getAllMessages(type: MessageType): string[] {
  return messages[type] || []
}

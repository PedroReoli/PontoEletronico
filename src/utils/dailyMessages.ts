// Array de mensagens motivacionais e inspiradoras para o dia
const dayMessages: string[] = [
  "A persistência é o caminho do êxito. - Charles Chaplin",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia. - Robert Collier",
  "Não é a carga que o quebra, mas a maneira como você a carrega. - Lou Holtz",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário. - Vidal Sassoon",
  "Acredite em si próprio e chegará um dia em que os outros não terão outra escolha senão acreditar com você. - Cynthia Kersey",
  "Cada segundo é tempo para mudar tudo para sempre. - Charles Chaplin",
  "Não espere por circunstâncias ideais. Nunca haverá um momento melhor que o agora para começar.",
  "Motivação é o que te faz começar. Hábito é o que te faz continuar. - Jim Ryun",
  "Seu trabalho vai preencher uma parte grande da sua vida, e a única maneira de ficar realmente satisfeito é fazer o que você acredita ser um ótimo trabalho. - Steve Jobs",
  "Não tenha medo de desistir do bom para perseguir o ótimo. - John D. Rockefeller",
  "A diferença entre uma pessoa bem-sucedida e as outras não é a falta de força, não é a falta de conhecimento, mas sim a falta de vontade. - Vince Lombardi",
  "O pessimista vê dificuldade em cada oportunidade. O otimista vê oportunidade em cada dificuldade. - Winston Churchill",
  "Não importa o que você decidiu. O que importa é que isso te faça feliz. - Steve Jobs",
  "Não é sobre ter tempo, é sobre fazer tempo. - Desconhecido",
  "Você nunca sabe que resultados virão da sua ação. Mas se você não fizer nada, não existirão resultados. - Mahatma Gandhi",
  "Não é o mais forte que sobrevive, nem o mais inteligente. Quem sobrevive é o mais disposto à mudança. - Charles Darwin",
  "Comece onde você está. Use o que você tem. Faça o que você pode. - Arthur Ashe",
  "O segredo para seguir em frente é começar. - Mark Twain",
  "Não deixe que o medo de perder seja maior que a excitação de vencer. - Robert Kiyosaki",
  "Se você não está disposto a arriscar, esteja disposto a uma vida comum. - Jim Rohn",
  "Toda ação humana, quer se torne positiva ou negativa, precisa depender de motivação. - Dalai Lama",
  "A vida é 10% o que acontece comigo e 90% como eu reajo a isso. - Charles Swindoll",
  "Você não pode mudar o vento, mas pode ajustar as velas do barco para chegar onde quer. - Confúcio",
  "O verdadeiro sucesso é encontrar seu propósito de vida, crescer para alcançar seu potencial máximo e plantar sementes que beneficiem outros. - John C. Maxwell",
  "Não importa o quão devagar você vá, desde que você não pare. - Confúcio",
  "Tente mover o mundo - o primeiro passo será mover a si mesmo. - Platão",
  "Você é o resultado das cinco pessoas com quem mais convive. - Jim Rohn",
  "Não tenha medo da mudança. Boas coisas se desfazem para que melhores possam se formar. - Desconhecido",
  "Você não pode voltar atrás e mudar o começo, mas pode começar de onde está e mudar o final. - C.S. Lewis",
  "Não são os anos em sua vida que contam. É a vida em seus anos. - Abraham Lincoln",
]

/**
 * Retorna uma mensagem aleatória do dia
 * @returns Mensagem do dia
 */
export function getRandomDayMessage(): string {
  const randomIndex = Math.floor(Math.random() * dayMessages.length)
  return dayMessages[randomIndex]
}

/**
 * Retorna todas as mensagens disponíveis
 * @returns Array de mensagens
 */
export function getAllDayMessages(): string[] {
  return dayMessages
}

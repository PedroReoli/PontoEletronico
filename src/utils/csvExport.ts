/**
 * Utilitário para exportação de dados em formato CSV
 */

/**
 * Converte um array de objetos em uma string CSV
 * @param data Array de objetos a serem convertidos
 * @param headers Cabeçalhos personalizados (opcional)
 * @returns String no formato CSV
 */
export function convertToCSV(data: any[], headers?: Record<string, string>): string {
  if (data.length === 0) {
    return ""
  }

  // Obter as chaves do primeiro objeto para usar como cabeçalhos
  const objectKeys = Object.keys(data[0])

  // Criar linha de cabeçalho
  const headerRow = objectKeys
    .map((key) => {
      // Usar cabeçalho personalizado se fornecido, caso contrário usar a chave
      return headers && headers[key] ? headers[key] : key
    })
    .join(",")

  // Criar linhas de dados
  const csvRows = data.map((item) => {
    return objectKeys
      .map((key) => {
        // Tratar valores nulos ou indefinidos
        const value = item[key] === null || item[key] === undefined ? "" : item[key]

        // Escapar aspas e adicionar aspas ao redor de strings
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`
        }

        // Formatar datas
        if (value instanceof Date) {
          return `"${value.toLocaleDateString()} ${value.toLocaleTimeString()}"`
        }

        return value
      })
      .join(",")
  })

  // Juntar cabeçalho e linhas
  return [headerRow, ...csvRows].join("\n")
}

/**
 * Faz o download de dados como um arquivo CSV
 * @param data Array de objetos a serem exportados
 * @param filename Nome do arquivo a ser baixado
 * @param headers Cabeçalhos personalizados (opcional)
 */
export function downloadCSV(data: any[], filename: string, headers?: Record<string, string>): void {
  const csvContent = convertToCSV(data, headers)

  // Criar um blob com o conteúdo CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Criar URL para o blob
  const url = URL.createObjectURL(blob)

  // Criar elemento de link para download
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Adicionar o link ao DOM, clicar nele e removê-lo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


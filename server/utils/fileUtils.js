import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Configuração para __dirname em ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Verifica se um arquivo existe
 * @param {string} filePath - Caminho do arquivo
 * @returns {boolean} Verdadeiro se o arquivo existir
 */
export const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Remove um arquivo
 * @param {string} filePath - Caminho do arquivo
 * @returns {boolean} Verdadeiro se o arquivo foi removido com sucesso
 */
export const removeFile = (filePath) => {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  } catch (error) {
    console.error("Erro ao remover arquivo:", error)
    return false
  }
}

/**
 * Obtém o caminho absoluto para um arquivo de upload
 * @param {string} filename - Nome do arquivo
 * @returns {string} Caminho absoluto do arquivo
 */
export const getUploadPath = (filename) => {
  return path.join(__dirname, "../../uploads", filename)
}


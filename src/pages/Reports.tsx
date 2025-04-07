"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import Layout from "../components/Layout"
import ExportButton from "../components/ExportButton"

interface TimeEntryReport {
  id: string
  date: string
  clockIn: string | null
  breakStart: string | null
  breakEnd: string | null
  clockOut: string | null
  totalWorked: string
  totalBreak: string
  balance: string
}

function Reports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<TimeEntryReport[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/reports/time-entries?month=${month}&year=${year}`)
        setReports(response.data)
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [month, year])

  // Preparar cabeçalhos para CSV
  const csvHeaders = {
    date: "Data",
    clockIn: "Entrada",
    breakStart: "Início Intervalo",
    breakEnd: "Fim Intervalo",
    clockOut: "Saída",
    totalWorked: "Total Trabalhado",
    totalBreak: "Tempo de Intervalo",
    balance: "Saldo",
  }

  // Gerar nome do arquivo CSV
  const getCSVFilename = () => {
    const monthName = format(new Date(year, month - 1), "MMMM", { locale: ptBR })
    return `relatorio-ponto-${monthName}-${year}.csv`
  }

  return (
    <Layout>
      <div className="reports-container">
        <div className="reports-header">
          <h1>Relatórios de Ponto</h1>

          <div className="reports-filters">
            <div className="filter-group">
              <label htmlFor="month">Mês:</label>
              <select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {format(new Date(2021, i, 1), "MMMM", { locale: ptBR })}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="year">Ano:</label>
              <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {Array.from({ length: 5 }, (_, i) => {
                  const yearValue = new Date().getFullYear() - 2 + i
                  return (
                    <option key={yearValue} value={yearValue}>
                      {yearValue}
                    </option>
                  )
                })}
              </select>
            </div>

            <ExportButton data={reports} filename={getCSVFilename()} headers={csvHeaders} className="btn-export">
              Exportar CSV
            </ExportButton>
          </div>
        </div>

        {loading ? (
          <p>Carregando relatórios...</p>
        ) : reports.length === 0 ? (
          <p>Nenhum registro encontrado para o período selecionado.</p>
        ) : (
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Entrada</th>
                  <th>Início Intervalo</th>
                  <th>Fim Intervalo</th>
                  <th>Saída</th>
                  <th>Total Trabalhado</th>
                  <th>Intervalo</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.date}</td>
                    <td>{report.clockIn || "-"}</td>
                    <td>{report.breakStart || "-"}</td>
                    <td>{report.breakEnd || "-"}</td>
                    <td>{report.clockOut || "-"}</td>
                    <td>{report.totalWorked}</td>
                    <td>{report.totalBreak}</td>
                    <td className={report.balance.startsWith("-") ? "negative-balance" : "positive-balance"}>
                      {report.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Reports


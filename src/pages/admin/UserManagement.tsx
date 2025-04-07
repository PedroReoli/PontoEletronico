"use client"

import type React from "react"

import { useState, useEffect } from "react"
import api from "../../services/api"
import Layout from "../../components/Layout"

interface User {
  id: string
  name: string
  email: string
  role: "EMPLOYEE" | "MANAGER" | "ADMIN"
  companyId: string
  companyName: string
  active: boolean
  createdAt: string
}

interface Company {
  id: string
  name: string
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    companyId: "",
    active: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersResponse, companiesResponse] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/companies"),
        ])

        setUsers(usersResponse.data)
        setCompanies(companiesResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post("/admin/users", formData)
      setUsers([...users, response.data])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) return

    try {
      const response = await api.put(`/admin/users/${currentUser.id}`, formData)
      setUsers(users.map((user) => (user.id === currentUser.id ? response.data : user)))
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao editar usuário:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
    }
  }

  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      companyId: user.companyId,
      active: user.active,
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      companyId: "",
      active: true,
    })
    setCurrentUser(null)
  }

  return (
    <Layout>
      <div className="user-management">
        <div className="page-header">
          <h1>Gerenciamento de Usuários</h1>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            Adicionar Usuário
          </button>
        </div>

        {loading ? (
          <p>Carregando usuários...</p>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Função</th>
                  <th>Empresa</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.role === "ADMIN" && "Administrador"}
                      {user.role === "MANAGER" && "Gestor"}
                      {user.role === "EMPLOYEE" && "Funcionário"}
                    </td>
                    <td>{user.companyName}</td>
                    <td>
                      <span className={`status-badge ${user.active ? "active" : "inactive"}`}>
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => openEditModal(user)}>
                          Editar
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Adicionar Usuário */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Adicionar Usuário</h2>
                <button className="btn-close" onClick={() => setShowAddModal(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Senha</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Função</label>
                  <select id="role" name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="EMPLOYEE">Funcionário</option>
                    <option value="MANAGER">Gestor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="companyId">Empresa</label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="active">Usuário ativo</label>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Editar Usuário */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Editar Usuário</h2>
                <button className="btn-close" onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleEditUser}>
                <div className="form-group">
                  <label htmlFor="edit-name">Nome</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">E-mail</label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-password">Senha (deixe em branco para manter)</label>
                  <input
                    type="password"
                    id="edit-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-role">Função</label>
                  <select id="edit-role" name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="EMPLOYEE">Funcionário</option>
                    <option value="MANAGER">Gestor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-companyId">Empresa</label>
                  <select
                    id="edit-companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="edit-active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="edit-active">Usuário ativo</label>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default UserManagement


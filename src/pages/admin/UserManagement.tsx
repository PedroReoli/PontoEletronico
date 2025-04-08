"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

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

  // Filtrar usuários com base no termo de pesquisa e filtro de função
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "MANAGER":
        return "Gestor"
      case "EMPLOYEE":
        return "Funcionário"
      default:
        return role
    }
  }

  return (
    <Layout>
      <div className="admin-page user-management">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1>Gerenciamento de Usuários</h1>
            <p className="page-description">Cadastre e gerencie os usuários do sistema</p>
          </div>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Usuário
          </motion.button>
        </motion.div>

        <motion.div
          className="search-filter-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="search-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <label>Filtrar por função:</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="role-filter">
              <option value="ALL">Todos</option>
              <option value="ADMIN">Administradores</option>
              <option value="MANAGER">Gestores</option>
              <option value="EMPLOYEE">Funcionários</option>
            </select>
          </div>
        </motion.div>

        <motion.div
          className="card users-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="loading-container">
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              <p>Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p>
                {searchTerm || roleFilter !== "ALL"
                  ? "Nenhum usuário encontrado com esses filtros"
                  : "Nenhum usuário cadastrado"}
              </p>
              {!searchTerm && roleFilter === "ALL" && (
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Cadastrar Primeiro Usuário
                </button>
              )}
            </div>
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
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="user-name-cell">
                        <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <span>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>{getRoleName(user.role)}</span>
                      </td>
                      <td>{user.companyName}</td>
                      <td>
                        <span className={`status-badge ${user.active ? "active" : "inactive"}`}>
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => openEditModal(user)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </motion.button>
                          <motion.button
                            className="btn-icon delete"
                            title="Excluir"
                            onClick={() => handleDeleteUser(user.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modal de Adicionar Usuário */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="modal-header">
                  <h2>Adicionar Usuário</h2>
                  <button className="btn-close" onClick={() => setShowAddModal(false)}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleAddUser}>
                  <div className="modal-body">
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
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Adicionar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Editar Usuário */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="modal-header">
                  <h2>Editar Usuário</h2>
                  <button className="btn-close" onClick={() => setShowEditModal(false)}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleEditUser}>
                  <div className="modal-body">
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
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salvar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default UserManagement

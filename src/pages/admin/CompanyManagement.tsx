"use client"

import type React from "react"

import { useState, useEffect } from "react"
import api from "../../services/api"
import "../../styles/pages/admin/CompanyManagement.css"

interface Company {
  id: string
  name: string
  logoUrl: string | null
  active: boolean
  createdAt: string
}

function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    active: true
  })
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/companies')
        setCompanies(response.data)
      } catch (error) {
        console.error('Erro ao buscar empresas:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompanies()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      active: true
    })
    setLogoFile(null)
  }
  
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Primeiro, criar a empresa
      const response = await api.post('/admin/companies', formData)
      
      // Se houver um logo, fazer upload
      if (logoFile) {
        const formData = new FormData()
        formData.append('logo', logoFile)
        
        const uploadResponse = await api.post(`/admin/companies/${response.data.id}/logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        response.data.logoUrl = uploadResponse.data.logoUrl
      }
      
      setCompanies([...companies, response.data])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error)
    }
  }
  
  const handleEditCompany = async (e: React.FormEvent) => {
}


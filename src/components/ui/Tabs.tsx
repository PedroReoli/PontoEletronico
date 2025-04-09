"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import "../../styles/components/tabs.css"

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  variant?: "default" | "pills" | "underline"
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, onChange, variant = "default", className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || "")

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (onChange) {
      onChange(tabId)
    }
  }

  return (
    <div className={`tabs-container tabs-${variant} ${className}`}>
      <div className="tabs-header" role="tablist">
        {items.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-item ${activeTab === tab.id ? "tab-active" : ""} ${tab.disabled ? "tab-disabled" : ""}`}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {variant === "underline" && activeTab === tab.id && (
              <motion.div
                className="tab-underline"
                layoutId="tab-underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {items.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tab-panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            className={`tab-panel ${activeTab === tab.id ? "tab-panel-active" : ""}`}
            hidden={activeTab !== tab.id}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs

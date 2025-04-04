"use client"

import { useState } from "react"

const HomePage = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-heading-1 mb-6">Bem-vindo ao Projeto</h1>
      <p className="text-body-1 mb-4">
        Esta é uma aplicação Vite + React com TypeScript, TailwindCSS, Prisma e PostgreSQL.
      </p>
      <div className="p-6 bg-surface rounded-lg shadow-md">
        <button onClick={() => setCount((count) => count + 1)} className="btn-primary">
          Contador: {count}
        </button>
      </div>
    </div>
  )
}

export default HomePage


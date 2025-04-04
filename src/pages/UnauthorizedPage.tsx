import { Link } from "react-router-dom"

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-heading-1 font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-body-1 mb-8">Você não tem permissão para acessar esta página.</p>
        <Link
          to="/"
          className="inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}

export default UnauthorizedPage


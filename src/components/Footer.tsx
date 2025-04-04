const Footer = () => {
  return (
    <footer className="bg-surface shadow-inner mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-body-2 text-muted">
            &copy; {new Date().getFullYear()} Meu Projeto. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-muted hover:text-primary transition-colors">
              Termos
            </a>
            <a href="#" className="text-muted hover:text-primary transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


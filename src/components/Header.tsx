import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="bg-surface shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-heading-4 font-bold text-primary">
            Meu Projeto
          </Link>
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link to="/" className="text-nav hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-nav hover:text-primary transition-colors">
                  Sobre
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header


const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-heading-1 mb-6">Sobre o Projeto</h1>
      <p className="text-body-1 mb-4">
        Este projeto foi construído com Vite, React, TypeScript, TailwindCSS, Prisma e PostgreSQL.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-surface rounded-lg shadow-md">
          <h2 className="text-heading-3 mb-4">Frontend</h2>
          <ul className="list-disc pl-5">
            <li>Vite</li>
            <li>React</li>
            <li>TypeScript</li>
            <li>TailwindCSS</li>
          </ul>
        </div>
        <div className="p-6 bg-surface rounded-lg shadow-md">
          <h2 className="text-heading-3 mb-4">Backend</h2>
          <ul className="list-disc pl-5">
            <li>Prisma</li>
            <li>PostgreSQL</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AboutPage


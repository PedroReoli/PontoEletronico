import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-heading-1 font-bold">Ponto Eletrônico</h1>
          <p className="text-body-1 text-muted mt-2">Recupere o acesso à sua conta</p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export default ForgotPasswordPage


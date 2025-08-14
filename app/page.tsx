export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Ettore AI Secretary</h1>
        <p className="text-lg text-gray-600">Segretario AI per professionisti wedding</p>

        <div className="space-y-4">
          <a
            href="/auth/login"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accedi
          </a>
          <a
            href="/auth/sign-up"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Registrati
          </a>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">Test di Connessione</h2>
          <p className="text-sm text-blue-600">Se vedi questa pagina, il routing di base funziona correttamente.</p>
        </div>
      </div>
    </div>
  )
}

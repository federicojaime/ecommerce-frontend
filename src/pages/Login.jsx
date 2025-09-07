import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Login = () => {
  const [credentials, setCredentials] = useState({ email: 'admin@ecommerce.com', password: 'password' })
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()

  console.log('Login component - user:', user)

  // Si ya hay usuario, redirigir
  if (user) {
    console.log('User exists, redirecting to dashboard...')
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Submitting login...')

    try {
      const result = await login(credentials.email, credentials.password)
      console.log('Login result:', result)
      toast.success('Bienvenido!')
      // No necesitamos navigate aquí porque el componente se re-renderizará
      // y el Navigate de arriba se ejecutará automáticamente
    } catch (error) {
      console.log('Login error:', error)
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Deco Home</h2>
          <p className="mt-2 text-sm text-gray-600">Control de ventas • Sin Rival 2025</p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" className="text-sm text-blue-600 hover:text-blue-500">
              Cambiar contraseña
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-8 py-3 border border-transparent rounded-lg font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        {/* DEBUG INFO */}
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <p>Debug - User: {user ? 'Logged in' : 'Not logged in'}</p>
          <p>Loading: {loading ? 'true' : 'false'}</p>
        </div>
      </div>
    </div>
  )
}

export default Login
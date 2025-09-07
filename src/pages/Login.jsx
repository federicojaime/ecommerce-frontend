import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: 'admin@ecommerce.com',
    password: 'password',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { user, login } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(credentials.email.trim(), credentials.password)
      toast.success('¡Bienvenido!')
    } catch (error) {
      const msg = error?.response?.data?.error || 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div
      className="
        h-dvh min-h-screen
        grid place-items-center
        bg-gradient-to-b from-slate-50 to-slate-100
        px-4 relative overflow-hidden
      "
    >
      {/* Fondo con blobs (contenidos dentro del overflow-hidden) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] h-64 w-64 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative">
        {/* Logo amplio y sin recuadro */}
        <div className="mb-6 sm:mb-8 text-center">
          <img
            src={logo}
            alt="Deco Home"
            className="mx-auto h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56 object-contain drop-shadow-xl"
            draggable={false}
          />
          <h1 className="mt-3 text-slate-800 text-3xl sm:text-4xl font-semibold tracking-tight">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Accedé a tu cuenta para continuar
          </p>
        </div>

        {/* Card azul (sin desbordes) */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-6 sm:p-8 shadow-2xl ring-1 ring-slate-700/50 backdrop-blur-md w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-amber-200"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-amber-200"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-amber-300 hover:text-amber-200 focus:underline"
                  onClick={() =>
                    toast('Contactá soporte para recuperarla', { icon: '🔑' })
                  }
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-200 hover:text-amber-100"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón dorado */}
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-3 text-slate-900 font-semibold shadow-lg shadow-amber-400/20 hover:shadow-amber-300/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-300 transition disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <span className="absolute left-4 inline-flex h-5 w-5 items-center justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  </span>
                  Ingresando…
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        {/* Footer corto (no empuja) */}
        <p className="mt-4 sm:mt-6 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Deco Home — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}

export default Login

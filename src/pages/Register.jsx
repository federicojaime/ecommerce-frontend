import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role
      })
      
      toast.success('¡Registro exitoso! Bienvenido')
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          'Error al registrarse'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 relative overflow-hidden">
      {/* Fondo con blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] h-64 w-64 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo y título */}
        <div className="mb-6 text-center">
          <img
            src={logo}
            alt="Deco Home"
            className="mx-auto h-32 w-32 sm:h-40 sm:w-40 object-contain drop-shadow-xl"
            draggable={false}
          />
          <h1 className="mt-3 text-slate-800 text-3xl sm:text-4xl font-semibold tracking-tight">
            Crear cuenta
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Únete a Deco Home
          </p>
        </div>

        {/* Formulario */}
        <div
          className="rounded-3xl p-6 sm:p-8 shadow-2xl ring-1 ring-slate-700/50 backdrop-blur-md w-full"
          style={{ backgroundColor: '#2d3c5d' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-amber-200">
                Nombre completo
              </label>
              <div className="mt-2 relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-200" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-white/20 bg-white/10 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-200">
                Email
              </label>
              <div className="mt-2 relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-200" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 border border-white/20 bg-white/10 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-200">
                Contraseña
              </label>
              <div className="mt-2 relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-200" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 bg-white/10 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-200 hover:text-amber-100"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-200">
                Confirmar contraseña
              </label>
              <div className="mt-2 relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-200" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-white/20 bg-white/10 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
                  placeholder="Confirma tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-200 hover:text-amber-100"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Rol (opcional para admin) */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-amber-200">
                Tipo de cuenta
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 block w-full px-4 py-3 border border-white/20 bg-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition"
              >
                <option value="customer" className="bg-slate-800 text-white">Cliente</option>
                <option value="staff" className="bg-slate-800 text-white">Empleado</option>
                <option value="admin" className="bg-slate-800 text-white">Administrador</option>
              </select>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#eddacb] to-[#eddacb] px-4 py-3 text-slate-900 font-semibold shadow-lg shadow-[#eddacb]/20 hover:shadow-amber-300/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-300 transition disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <span className="absolute left-4 inline-flex h-5 w-5 items-center justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  </span>
                  Creando cuenta…
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Link al login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-amber-200">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-semibold text-amber-300 hover:text-amber-100 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 sm:mt-6 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Deco Home — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}

export default Register
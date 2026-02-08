import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { api } from '../services/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminToken') !== null
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await api.auth.login(username, password)
      if (response.success && response.token) {
        localStorage.setItem('adminToken', response.token)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

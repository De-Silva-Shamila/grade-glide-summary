
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  userProfile: { username: string; full_name: string } | null
  updateProfile: (fullName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<{ username: string; full_name: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile with a slight delay to avoid race conditions
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('username, full_name')
                .eq('id', session.user.id)
                .single()
              
              if (error) {
                console.error('Error fetching profile:', error)
                // If profile doesn't exist, create one
                if (error.code === 'PGRST116') {
                  const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      username: session.user.email?.split('@')[0] || 'user',
                      full_name: session.user.user_metadata?.full_name || ''
                    })
                  
                  if (!insertError) {
                    setUserProfile({
                      username: session.user.email?.split('@')[0] || 'user',
                      full_name: session.user.user_metadata?.full_name || ''
                    })
                  }
                }
              } else {
                setUserProfile(profile)
              }
            } catch (error) {
              console.error('Profile fetch error:', error)
            }
          }, 100)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting to sign up:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            username: email.split('@')[0]
          }
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      console.log('Sign up successful:', data)
      
      // Check if user needs email confirmation
      if (data.user && !data.session) {
        toast({
          title: "Account Created!",
          description: "Please check your email to confirm your account before signing in.",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "You can now sign in with your credentials.",
        })
      }
      
      return { error: null }
    } catch (error: any) {
      console.error('Sign up exception:', error)
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        let errorMessage = error.message
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.'
        }
        
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        })
        return { error }
      }

      console.log('Sign in successful:', data.user?.email)
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
      
      return { error: null }
    } catch (error: any) {
      console.error('Sign in exception:', error)
      toast({
        title: "Sign In Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        })
      }
    } catch (error: any) {
      console.error('Sign out exception:', error)
    }
  }

  const updateProfile = async (fullName: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setUserProfile(prev => prev ? { ...prev, full_name: fullName } : null)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error('Profile update exception:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      userProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

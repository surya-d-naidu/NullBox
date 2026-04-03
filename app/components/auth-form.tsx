'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function AuthForm() {
  // Note: If useActionState is not found in your React version, swap with useFormState from react-dom
  const [loginState, loginAction, loginPending] = useActionState(login, null)

  return (
    <div className="w-full max-w-md p-8 rounded-xl glass-panel relative overflow-hidden shadow-2xl border border-white/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter neon-text font-mono">NULL BOX</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest"> // Authenticaton Required</p>
      </div>

      <form action={loginAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Registration Number</label>
          <Input name="registrationNumber" type="text" placeholder="24BCS..." required className="bg-black/50 border-white/10 focus:border-primary/50" />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
          <Input name="password" type="password" placeholder="********" required className="bg-black/50 border-white/10 focus:border-primary/50" />
        </div>

        {loginState?.error && (
          <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{loginState.error}</p>
        )}

        <Button
          type="submit"
          className="w-full font-mono uppercase tracking-widest mt-4"
          variant="default"
          disabled={loginPending}
        >
          {loginPending ? 'Authenticating...' : 'Access System'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">
          Registration temporarily disabled. Contact admin.
        </p>
      </div>
    </div>
  )
}

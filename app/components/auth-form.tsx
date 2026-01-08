'use client'

import { useActionState, useState } from 'react';
import { login, register } from '@/app/actions/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'framer-motion';

export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);

    // Note: If useActionState is not found in your React version, swap with useFormState from react-dom
    const [loginState, loginAction, loginPending] = useActionState(login, null);
    const [registerState, registerAction, registerPending] = useActionState(register, null);

    return (
        <div className="w-full max-w-md p-8 rounded-xl glass-panel relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tighter neon-text font-mono">
                    NULL BOX
                </h1>
                <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest">
                    {isLogin ? ' // Authenticaton Required' : ' // Initialize Protocol'}
                </p>
            </div>

            <form action={isLogin ? loginAction : registerAction} className="space-y-4">
                {!isLogin && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Username</label>
                            <Input name="username" placeholder="Codename" required className="bg-black/50 border-white/10 focus:border-primary/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                            <Input name="email" type="email" placeholder="access@corp.local" required className="bg-black/50 border-white/10 focus:border-primary/50" />
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Registration Number</label>
                    <Input name="registrationNumber" type="text" placeholder="24BCS..." required className="bg-black/50 border-white/10 focus:border-primary/50" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                    <Input name="password" type="password" placeholder="********" required className="bg-black/50 border-white/10 focus:border-primary/50" />
                </div>

                {isLogin && loginState?.error && (
                    <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{loginState.error}</p>
                )}
                {!isLogin && registerState?.error && (
                    <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{registerState.error}</p>
                )}

                <Button
                    type="submit"
                    className="w-full font-mono uppercase tracking-widest mt-4"
                    variant="default"
                    disabled={isLogin ? loginPending : registerPending}
                >
                    {isLogin ? (loginPending ? 'Authenticating...' : 'Access System') : (registerPending ? 'Initializing...' : 'Register Identity')}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                >
                    [{isLogin ? " Create New Identity " : " Return to Login "}]
                </button>
            </div>
        </div>
    )
}

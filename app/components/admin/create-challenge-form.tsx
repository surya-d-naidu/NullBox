'use client'

import { useActionState, useState } from 'react';
import { createChallenge } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Plus } from 'lucide-react';

export function CreateChallengeForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, pending] = useActionState(createChallenge, null);

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} variant="default">
                <Plus size={16} className="mr-2" />
                DEPLOY NEW MISSION
            </Button>
        )
    }

    return (
        <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-in slide-in-from-top-4 val-card relative overflow-hidden">
            <div className="val-corner-tl" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-mono text-primary">New Mission Parameters</h2>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">Close</button>
            </div>

            <form action={action} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Title</label>
                        <Input name="title" required className="bg-black/50 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
                        <Input name="category" placeholder="Web, Pwn, Crypto..." required className="bg-black/50 border-white/10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                    <textarea name="description" required className="w-full h-24 rounded-md border border-input bg-black/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Points</label>
                        <Input name="points" type="number" defaultValue="100" required className="bg-black/50 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Internal Port</label>
                        <Input name="internalPort" type="number" placeholder="e.g. 80" className="bg-black/50 border-white/10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Docker Image Name (Optional)</label>
                    <Input name="imageName" placeholder="e.g. ctf-pwn-demo" className="bg-black/50 border-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Hints (One per line)</label>
                        <textarea name="hints" className="w-full h-24 rounded-none border border-input bg-black/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Hint 1&#10;Hint 2" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">Resources (Title|URL one per line)</label>
                        <textarea name="resources" className="w-full h-24 rounded-none border border-input bg-black/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Documentation|https://docs.example.com&#10;Tool|https://tool.example.com" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Flag</label>
                    <Input name="flag" placeholder="CTF{...}" required className="bg-black/50 border-white/10" />
                </div>

                {state?.error && <p className="text-red-500 text-xs">{state.error}</p>}
                {state?.success && <p className="text-green-500 text-xs">{state.message}</p>}

                <div className="flex justify-end space-x-4 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="default" disabled={pending}>{pending ? 'DEPLOYING...' : 'CONFIRM DEPLOYMENT'}</Button>
                </div>
            </form>
        </div>
    )
}

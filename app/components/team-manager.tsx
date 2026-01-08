'use client'

import { useActionState, useState } from 'react';
import { createTeam, joinTeam } from '@/app/actions/team';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export function TeamManager() {
    const [action, setAction] = useState<'create' | 'join'>('create');

    // Note: fallback to useFormState if needed in this environment
    const [createState, createAction, createPending] = useActionState(createTeam, null);
    const [joinState, joinAction, joinPending] = useActionState(joinTeam, null);

    return (
        <div className="bg-black/50 border border-white/10 p-6 flex flex-col justify-center val-card relative overflow-hidden">
            <div className="val-corner-tl" />
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-wider">
                {action === 'create' ? 'Initialize New Unit' : 'Join Existing Unit'}
            </h2>
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setAction('create')}
                    className={`flex-1 pb-2 border-b-2 transition-all font-mono text-sm tracking-widest ${action === 'create' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
                >
                    CREATE UNIT
                </button>
                <button
                    onClick={() => setAction('join')}
                    className={`flex-1 pb-2 border-b-2 transition-all font-mono text-sm tracking-widest ${action === 'join' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
                >
                    JOIN UNIT
                </button>
            </div>

            {action === 'create' ? (
                <form action={createAction} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">New Unit Designation</label>
                        <Input name="name" placeholder="E.g. SECTOR_07" required className="bg-white/5 border-white/10 focus:border-primary/50 text-lg" />
                    </div>
                    {createState?.error && (
                        <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{createState.error}</p>
                    )}
                    <Button type="submit" className="w-full font-mono uppercase tracking-widest" variant="default" disabled={createPending}>
                        {createPending ? 'ESTABLISHING UNIT...' : 'CREATE UNIT'}
                    </Button>
                </form>
            ) : (
                <form action={joinAction} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Access Code</label>
                        <Input name="joinCode" placeholder="Enter 8-digit code" required className="bg-white/5 border-white/10 focus:border-primary/50 text-lg" />
                    </div>
                    {joinState?.error && (
                        <p className="text-red-500 text-xs font-mono border border-red-500/20 bg-red-500/10 p-2 rounded">{joinState.error}</p>
                    )}
                    <Button type="submit" className="w-full font-mono uppercase tracking-widest" variant="default" disabled={joinPending}>
                        {joinPending ? 'VERIFYING...' : 'JOIN UNIT'}
                    </Button>
                </form>
            )}
        </div>
    )
}

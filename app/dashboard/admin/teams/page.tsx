import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Shield, Key, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AdminTeamsPage() {
    const session = await getSession();
    if (!session || session.role !== 'admin') redirect('/dashboard');

    const teams = await prisma.team.findMany({
        include: {
            members: true
        },
        orderBy: {
            score: 'desc'
        }
    });

    return (
        <div className="space-y-8">
            <header className="border-l-4 border-primary pl-4">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Unit Database</h1>
                <p className="text-muted-foreground mt-2 font-bold tracking-widest text-sm uppercase">[Registry Access: Authorised]</p>
            </header>

            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="text-left p-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">Team</th>
                                <th className="text-left p-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">Join Code</th>
                                <th className="text-left p-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">Score</th>
                                <th className="text-left p-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">Operatives</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {teams.map((team) => (
                                <tr key={team.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold font-mono text-white">{team.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{team.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-mono text-sm bg-black/30 w-fit px-2 py-1 rounded border border-white/10">
                                            <Key size={14} className="text-primary" />
                                            <span className="text-white">{team.joinCode}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-mono text-lg font-bold text-primary">
                                            <Trophy size={16} />
                                            {team.score}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-2">
                                            {team.members.map(member => (
                                                <div key={member.id} className="flex items-center gap-2 text-sm">
                                                    <Users size={14} className="text-muted-foreground" />
                                                    <span className="text-white">{member.username}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">[{member.registrationNumber || member.email}]</span>
                                                </div>
                                            ))}
                                            {team.members.length === 0 && (
                                                <span className="text-xs text-muted-foreground italic">No operatives assigned</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {teams.length === 0 && (
                <div className="text-center p-12 rounded-xl border border-white/10 bg-white/5 border-dashed">
                    <p className="text-muted-foreground font-mono">No units found in registry.</p>
                </div>
            )}
        </div>
    )
}

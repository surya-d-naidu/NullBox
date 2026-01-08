import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TeamManager } from '@/app/components/team-manager';

export default async function TeamPage() {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            team: {
                include: { members: true }
            }
        }
    });

    if (!user?.team) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 mt-12">
                <div className="text-center space-y-2 mb-12 border-b-4 border-primary pb-4 inline-block px-8">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Unit Assignment</h1>
                    <p className="text-muted-foreground font-bold tracking-widest text-sm uppercase">Operative Status: Independent</p>
                </div>
                <TeamManager />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
                <div className="border-l-4 border-primary pl-4">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{user.team.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                        <p className="text-xs font-bold font-mono text-muted-foreground bg-white/5 px-2 py-1 uppercase tracking-widest">Unit ID: {user.team.id.substring(0, 8)}</p>
                        <p className="text-xs font-bold font-mono text-white bg-primary px-2 py-1 uppercase tracking-widest">Score: {user.team.score}</p>
                    </div>
                </div>
                <div className="md:text-right w-full md:w-auto">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Unit Access Code</p>
                    <div className="inline-flex items-center space-x-2 bg-black/50 px-4 py-2 border border-primary/30">
                        <code className="text-white font-mono text-xl tracking-widest font-black">{user.team.joinCode}</code>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-muted-foreground">Active Operatives</h2>
                    <span className="text-xs font-mono text-muted-foreground">{user.team.members.length} MEMBERS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.team.members.map(member => (
                        <div key={member.id} className="p-4 border border-white/10 bg-white/5 flex items-center space-x-4 group val-card">
                            <div className="w-12 h-12 bg-black flex items-center justify-center border border-white/20 font-black font-sans italic text-lg text-muted-foreground group-hover:text-white group-hover:bg-primary transition-colors">
                                {member.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-white uppercase tracking-wider">{member.username}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{member.role}</p>
                            </div>
                            {member.id === session.userId && (
                                <span className="ml-auto text-[10px] bg-primary text-white px-2 py-0.5 font-bold uppercase tracking-widest">YOU</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

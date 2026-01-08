import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BadgeCheck, Terminal, Flame, Globe, Lock } from 'lucide-react';

export default async function ChallengesPage() {
    const session = await getSession();
    if (!session) return null;

    // Fallback if user has no team, teamId might be null.
    // We only fetch submissions if teamId is present.
    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    const challenges = await prisma.challenge.findMany({
        include: {
            submissions: {
                where: { teamId: user?.teamId || 'dummy-uuid' }
            }
        }
    });

    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'pwn': return <Terminal size={20} />;
            case 'web': return <Globe size={20} />;
            case 'crypto': return <Lock size={20} />;
            default: return <Flame size={20} />;
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col space-y-2 border-l-4 border-primary pl-4">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Active Missions</h1>
                <p className="text-muted-foreground font-bold tracking-widest text-sm uppercase">Select an objective to begin.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(chal => {
                    const isSolved = chal.submissions.some(s => s.isCorrect);
                    const Icon = getIcon(chal.category);

                    return (
                        <Link href={`/dashboard/challenges/${chal.id}`} key={chal.id} className="block group h-full">
                            <div className={`h-full p-6 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col ${isSolved ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(0,255,157,0.1)]' : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10'}`}>
                                {isSolved && (
                                    <div className="absolute top-0 right-0 p-4 bg-gradient-to-bl from-primary/20 to-transparent">
                                        <BadgeCheck size={24} className="text-primary" />
                                    </div>
                                )}
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className={`p-2 rounded-lg ${isSolved ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground group-hover:text-primary transition-colors'}`}>
                                        {Icon}
                                    </div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground border border-white/10 px-2 py-0.5 rounded">{chal.category}</span>
                                </div>

                                <h2 className="text-xl font-bold font-mono group-hover:text-primary transition-colors mb-2">{chal.title}</h2>
                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{chal.description}</p>

                                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Identify</span>
                                        <span className="font-mono font-bold text-lg">{chal.points} PTS</span>
                                    </div>
                                    {isSolved ? (
                                        <span className="text-xs text-primary font-mono uppercase border border-primary/20 px-3 py-1 rounded bg-primary/10">COMPLETED</span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground font-mono uppercase group-hover:text-white transition-colors flex items-center">
                                            INITIALIZE <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

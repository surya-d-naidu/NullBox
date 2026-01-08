import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChallengeInterface } from '@/app/components/challenge-interface';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { team: true }
    });

    const challenge = await prisma.challenge.findUnique({
        where: { id },
        include: { hints: true, resources: true }
    });

    if (!challenge) {
        return (
            <div className="p-12 text-center text-muted-foreground font-mono">
                MISSION NOT FOUND
            </div>
        )
    }

    // Check submit status
    const submission = await prisma.submission.findFirst({
        where: {
            teamId: user?.team?.id || 'dummy',
            challengeId: id,
            isCorrect: true
        }
    });

    // Check container status
    const container = await prisma.container.findFirst({
        where: {
            teamId: user?.team?.id || 'dummy',
            challengeId: id,
            expiresAt: { gt: new Date() }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <Link href="/dashboard/challenges" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors font-mono uppercase tracking-wider">
                    <ArrowLeft size={14} className="mr-2" />
                    Back to Mission Overview
                </Link>
                <div className="flex items-center justify-between border-l-4 border-primary pl-4">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">{challenge.title}</h1>
                    <span className="px-3 py-1 bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-white">{challenge.category}</span>
                </div>
            </header>

            <ChallengeInterface
                challenge={challenge}
                activeContainer={container ? {
                    host: 'localhost', // In prod this would be the external IP
                    port: container.hostPort,
                    expiresAt: container.expiresAt
                } : null}
                isSolved={!!submission}
            />
        </div>
    )
}

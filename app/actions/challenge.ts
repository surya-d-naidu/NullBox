'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { startChallengeContainer, stopContainer } from '@/lib/docker';
import { revalidatePath } from 'next/cache';

export async function startChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const challengeId = formData.get('challengeId') as string;
    if (!challengeId) return { error: "Challenge ID required" };

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { team: true }
    });

    if (!user?.team) return { error: "You must be in a team to start challenges" };

    try {
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge || !challenge.imageName) return { error: "Challenge not found or invalid" };

        // Check active container
        const existing = await prisma.container.findFirst({
            where: {
                teamId: user.team.id,
                challengeId: challengeId,
                expiresAt: { gt: new Date() }
            }
        });

        if (existing) {
            return {
                success: true,
                host: 'localhost',
                port: existing.hostPort,
                expiresAt: existing.expiresAt
            };
        }

        // Start new
        const { containerId, hostPort } = await startChallengeContainer(challenge.imageName, challenge.internalPort || 80);

        // Save to DB
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma.container.create({
            data: {
                containerId,
                hostPort,
                teamId: user.team.id,
                challengeId: challenge.id,
                expiresAt
            }
        });

        revalidatePath(`/dashboard/challenges`);
        return { success: true, host: 'localhost', port: hostPort, expiresAt };

    } catch (e) {
        console.error(e);
        return { error: "Failed to start environment. Contact admin." };
    }
}

export async function submitFlag(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const challengeId = formData.get('challengeId') as string;
    const flag = formData.get('flag') as string;

    if (!challengeId || !flag) return { error: "Missing challenge ID or flag" };

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { team: true }
    });

    if (!user?.team) return { error: "No team found" };

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return { error: "Challenge not found" };

    // Check if already solved
    const solved = await prisma.submission.findFirst({
        where: {
            teamId: user.team.id,
            challengeId: challengeId,
            isCorrect: true
        }
    });

    if (solved) return { error: "Already solved by your team" };

    // Check flag
    if (flag.trim() === challenge.flag) {
        // Correct
        await prisma.$transaction([
            prisma.submission.create({
                data: {
                    teamId: user.team.id,
                    challengeId: challengeId,
                    isCorrect: true
                }
            }),
            prisma.team.update({
                where: { id: user.team.id },
                data: {
                    score: { increment: challenge.points }
                }
            })
        ]);

        revalidatePath('/dashboard');
        return { success: true, message: "Flag Correct! Points awarded." };
    } else {
        return { error: "Incorrect Flag" };
    }
}

export async function stopChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const challengeId = formData.get('challengeId') as string;
    if (!challengeId) return { error: "Challenge ID required" };

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { team: true }
    });

    if (!user?.team) return { error: "No team" };

    const container = await prisma.container.findFirst({
        where: {
            teamId: user.team.id,
            challengeId: challengeId,
            expiresAt: { gt: new Date() }
        }
    });

    if (container) {
        await stopContainer(container.containerId);
        await prisma.container.delete({ where: { id: container.id } });
        revalidatePath(`/dashboard/challenges`);
        return { success: true };
    }
    return { error: "No active container" };
}

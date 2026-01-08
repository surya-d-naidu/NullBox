'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { stopContainer } from '@/lib/docker';

export async function createChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const points = parseInt(formData.get('points') as string);
    const flag = formData.get('flag') as string;
    const imageName = formData.get('imageName') as string;
    const internalPort = formData.get('internalPort') ? parseInt(formData.get('internalPort') as string) : null;

    if (!title || !description || !category || !points || !flag) {
        return { error: "Missing required fields" };
    }

    try {
        await prisma.challenge.create({
            data: {
                title,
                description,
                category,
                points,
                flag,
                imageName: imageName || null,
                internalPort,
                hints: {
                    create: (formData.get('hints') as string)?.split('\n').filter(h => h.trim()).map(h => ({ content: h.trim() })) || []
                },
                resources: {
                    create: (formData.get('resources') as string)?.split('\n').filter(r => r.trim()).map(r => {
                        const [title, url] = r.split('|');
                        return { title: title?.trim() || 'Resource', url: url?.trim() || '#' };
                    }) || []
                }
            }
        });

        revalidatePath('/dashboard/admin/challenges');
        revalidatePath('/dashboard/challenges'); // Update user view too
        return { success: true, message: "Challenge deployed successfully" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create challenge" };
    }
}

export async function deleteChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const id = formData.get('id') as string;
    if (!id) return { error: "No ID provided" };

    try {
        await prisma.submission.deleteMany({ where: { challengeId: id } });
        await prisma.container.deleteMany({ where: { challengeId: id } });

        await prisma.challenge.delete({ where: { id } });

        revalidatePath('/dashboard/admin/challenges');
        return { success: true, message: "Challenge decommissioned" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to delete challenge" };
    }
}

export async function adminStopContainer(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const containerId = formData.get('containerId') as string; // This is the DB ID
    if (!containerId) return { error: "No Container ID provided" };

    try {
        const container = await prisma.container.findUnique({ where: { id: containerId } });
        if (container) {
            await stopContainer(container.containerId); // Docker ID
            await prisma.container.delete({ where: { id: containerId } });
        }

        revalidatePath('/dashboard/admin/containers');
        revalidatePath('/dashboard/challenges');
        return { success: true, message: "Container terminated" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to stop container" };
    }
}

export async function resetScores() {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    try {
        await prisma.submission.deleteMany({});
        await prisma.team.updateMany({
            data: { score: 0 }
        });

        revalidatePath('/dashboard/leaderboard');
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/teams');
        return { success: true, message: "Scores reset successfully" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to reset scores" };
    }
}

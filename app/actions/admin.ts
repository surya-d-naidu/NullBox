'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { stopContainer } from '@/lib/docker';
import {
    assertSafeHttpsUrl,
    isSafeRecordId,
    isSafeDockerImageReference,
    isValidPort,
    limits,
    sanitizePlainText
} from '@/lib/validation';

export async function createChallenge(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: "Unauthorized" };

    const title = sanitizePlainText(String(formData.get('title') ?? ''), 500);
    const description = sanitizePlainText(String(formData.get('description') ?? ''), limits.maxTextField);
    const category = sanitizePlainText(String(formData.get('category') ?? ''), 120);
    const points = parseInt(formData.get('points') as string, 10);
    const flag = sanitizePlainText(String(formData.get('flag') ?? ''), limits.maxFlagLen);
    const imageNameRaw = String(formData.get('imageName') ?? '').trim();
    const internalPortRaw = formData.get('internalPort') ? parseInt(formData.get('internalPort') as string, 10) : null;

    if (!title || !description || !category || !Number.isFinite(points) || !flag) {
        return { error: "Missing required fields" };
    }
    if (points < 1 || points > 1_000_000) {
        return { error: "Points must be between 1 and 1000000" };
    }
    let imageName: string | null = null;
    if (imageNameRaw) {
        if (!isSafeDockerImageReference(imageNameRaw)) {
            return { error: "Invalid Docker image name: use only safe characters (e.g. nginx:alpine, repo/name:tag)" };
        }
        imageName = imageNameRaw;
    }
    let internalPort: number | null = null;
    if (internalPortRaw !== null && !Number.isNaN(internalPortRaw)) {
        if (!isValidPort(internalPortRaw)) {
            return { error: "Internal port must be between 1 and 65535" };
        }
        internalPort = internalPortRaw;
    }

    const hintsLines = (formData.get('hints') as string)?.split('\n').filter(h => h.trim()) ?? [];
    const hintsCreate = hintsLines.map((h) => ({
        content: sanitizePlainText(h.trim(), 5000)
    }));

    const resourceLines = (formData.get('resources') as string)?.split('\n').filter(r => r.trim()) ?? [];
    const resourcesCreate: { title: string; url: string }[] = [];
    for (const line of resourceLines) {
        const [t, u] = line.split('|');
        const resourceTitle = sanitizePlainText((t ?? '').trim() || 'Resource', 200);
        const rawUrl = (u ?? '').trim();
        const safeUrl = assertSafeHttpsUrl(rawUrl);
        if (!safeUrl) {
            return { error: `Invalid resource URL (http/https only): ${rawUrl.slice(0, 80)}` };
        }
        resourcesCreate.push({ title: resourceTitle, url: safeUrl });
    }

    try {
        await prisma.challenge.create({
            data: {
                title,
                description,
                category,
                points,
                flag,
                imageName,
                internalPort,
                hints: {
                    create: hintsCreate
                },
                resources: {
                    create: resourcesCreate
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

    const id = String(formData.get('id') ?? '');
    if (!id || !isSafeRecordId(id)) return { error: "No ID provided" };

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

    const containerId = String(formData.get('containerId') ?? ''); // DB row id (cuid)
    if (!containerId || !isSafeRecordId(containerId)) return { error: "No Container ID provided" };

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

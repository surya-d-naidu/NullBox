'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

export async function createTeam(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get('name') as string;
    if (!name || name.length < 3) return { error: "Team name must be at least 3 characters" };

    try {
        // Generate a random join code
        const joinCode = randomBytes(4).toString('hex').toUpperCase();

        const team = await prisma.team.create({
            data: {
                name,
                joinCode,
                members: {
                    connect: { id: session.userId }
                }
            }
        });

        // Update session? No, session only holds basic info. But we might need to refresh if we cached teamId.

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/team');
        return { success: true, message: "Team created successfully" };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create team. Name might be taken." };
    }
}

export async function joinTeam(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const joinCode = formData.get('joinCode') as string;

    try {
        const team = await prisma.team.findUnique({
            where: { joinCode }
        });

        if (!team) return { error: "Invalid join code" };

        await prisma.user.update({
            where: { id: session.userId },
            data: { teamId: team.id }
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/team');
        return { success: true, message: "Joined team successfully" };
    } catch (e) {
        return { error: "Failed to join team" };
    }
}

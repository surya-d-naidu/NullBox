'use server'

import { prisma } from '@/lib/prisma';
import { setSession, clearSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const registrationNumber = formData.get('registrationNumber') as string;
    const password = formData.get('password') as string;

    if (!registrationNumber || !password) {
        return { error: 'Please provide both registration number and password' };
    }

    const user = await prisma.user.findUnique({ where: { registrationNumber } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return { error: 'Invalid credentials' };
    }

    await setSession({ userId: user.id, username: user.username, role: user.role });
    redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const registrationNumber = formData.get('registrationNumber') as string;
    const password = formData.get('password') as string;

    if (!email || !username || !password || !registrationNumber) {
        return { error: "All fields are required" };
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }, { registrationNumber }] }
        });

        if (existingUser) {
            return { error: "User with this email, username, or registration number already exists" };
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                registrationNumber,
                password: hashedPassword,
            },
        });

        await setSession({ userId: user.id, username: user.username, role: user.role });
    } catch (e) {
        console.error(e);
        return { error: "An error occurred during registration" };
    }
    redirect('/dashboard');
}

export async function logout() {
    await clearSession();
    redirect('/');
}

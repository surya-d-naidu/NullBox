import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx';
import path from 'path';
import crypto from 'crypto';

const config = {
    url: process.env.DATABASE_URL || "file:./dev.db",
}

const adapter = new PrismaLibSql(config)
const prisma = new PrismaClient({ adapter })

async function main() {
    const adminPassword = process.env.ADMIN_PASSWORD || 'Viper$Trike_CmD_99!'; // Very strong default if env missing
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    // Create Admin User if not exists
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nullbox.ctf' },
        update: {},
        create: {
            email: 'admin@nullbox.ctf',
            username: 'CommandCore',
            registrationNumber: 'ADMIN001',
            password: hashedPassword,
            role: 'admin'
        }
    });

    console.log(`Initialized Admin [CommandCore] with password: ${adminPassword}`);

    const excelPath = path.join(process.cwd(), 'ctf.xlsx');

    // Helper to read excel safely handling import variations
    let workbook;
    try {
        // @ts-ignore
        workbook = XLSX.readFile ? XLSX.readFile(excelPath) : XLSX.default.readFile(excelPath);
    } catch (e) {
        console.error("Failed to read Excel file at", excelPath, e);
    };

    if (workbook) {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // @ts-ignore
        const data: any[] = XLSX.utils ? XLSX.utils.sheet_to_json(sheet) : XLSX.default.utils.sheet_to_json(sheet);

        console.log(`Found ${data.length} rows in ctf.xlsx`);

        for (const row of data) {
            const teamName = row['Team Name'];
            const leaderName = row['Full Name (Team Leader)'];
            const leaderEmail = row['College Email id (Team Leader)'];
            const leaderReg = row['Registration Number (Team Leader)'];
            const leaderMobile = row['Whatsapp Number (Team Leader)'];

            const memberName = row['Full Name (Team Member)'];
            const memberEmail = row['College Email id (Team Member)'];
            const memberReg = row['Registration Number (Team Member)'];

            if (!teamName || !leaderEmail) {
                console.log(`Skipping invalid row: ${JSON.stringify(row)}`);
                continue;
            }

            // Create Team
            const team = await prisma.team.upsert({
                where: { name: teamName },
                update: {},
                create: {
                    name: teamName,
                    joinCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
                }
            });

            console.log(`Processed Team: ${teamName}`);

            // Create Leader
            if (leaderEmail && leaderMobile) {
                const password = String(leaderMobile).trim();
                const hashedPassword = bcrypt.hashSync(password, 10);
                const username = leaderReg ? `${leaderName}_${leaderReg}` : leaderName; // Ensure unique

                try {
                    await prisma.user.upsert({
                        where: { email: leaderEmail },
                        update: {
                            password: hashedPassword, // Update password just in case
                            teamId: team.id,
                            registrationNumber: String(leaderReg || 'UNKNOWN_LEADER_REG_' + Date.now())
                        },
                        create: {
                            email: leaderEmail,
                            username: username.replace(/\s+/g, '_'),
                            registrationNumber: String(leaderReg || 'UNKNOWN_LEADER_REG_' + Date.now()),
                            password: hashedPassword,
                            role: 'user',
                            teamId: team.id
                        }
                    });
                    console.log(`  - Upserted Leader: ${username}`);
                } catch (e) {
                    console.error(`  - Failed to upsert leader ${leaderEmail}`, e);
                }
            }

            // Create Member
            if (memberEmail) {
                // Use leader's mobile as password fallback
                const password = String(leaderMobile).trim();
                const hashedPassword = bcrypt.hashSync(password, 10);
                const username = memberReg ? `${memberName}_${memberReg}` : memberName;

                try {
                    await prisma.user.upsert({
                        where: { email: memberEmail },
                        update: {
                            teamId: team.id,
                            registrationNumber: String(memberReg || 'UNKNOWN_MEMBER_REG_' + Date.now())
                        },
                        create: {
                            email: memberEmail,
                            username: username.replace(/\s+/g, '_'),
                            registrationNumber: String(memberReg || 'UNKNOWN_MEMBER_REG_' + Date.now()),
                            password: hashedPassword,
                            role: 'user',
                            teamId: team.id
                        }
                    });
                    console.log(`  - Upserted Member: ${username}`);
                } catch (e) {
                    console.error(`  - Failed to upsert member ${memberEmail}`, e);
                }
            }
        }
    } else {
        console.log("Skipping Excel seeding - file not read.");
    }

    try {
        await prisma.challenge.createMany({
            data: [
                {
                    title: 'Ghost in the Shell Pwn',
                    description: 'Access the shell and retrieve the flag from /root/flag.txt. Connection requires netcat.',
                    category: 'Pwn',
                    points: 500,
                    imageName: 'ctf-pwn-demo',
                    internalPort: 1337,
                    flag: 'CTF{ghost_protocol_initiated}',
                },
                {
                    title: 'Source Inspector',
                    description: 'The developers left a secret in the source code of this web page.',
                    category: 'Web',
                    points: 100,
                    imageName: 'nginx:alpine',
                    internalPort: 80,
                    flag: 'CTF{html_comments_are_not_secure}',
                },
                {
                    title: 'Quantum Entanglement',
                    description: 'Decrypt the message using the provided public key.',
                    category: 'Crypto',
                    points: 300,
                    flag: 'CTF{qubits_are_cool}',
                }
            ],
            // @ts-ignore
            skipDuplicates: true
        })
    } catch (e) {
        console.log("Challenges might already exist or error creating them:", e);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

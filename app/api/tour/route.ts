import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. GET ALL: Sabhi tours ki list fetch karne ke liye
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                // Full config heavy ho sakta hai, isliye sirf basic info aur scene count select kar rahe hain
                config: true 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error('Fetch All Error:', error);
        return NextResponse.json(
            { error: 'Tours fetch karne mein dikkat aayi' },
            { status: 500 }
        );
    }
}

// 2. CREATE: Naya tour create karne ke liye
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, config } = body;

        if (!name || !config) {
            return NextResponse.json(
                { error: 'Name aur Config data required hain' },
                { status: 400 }
            );
        }

        const newProject = await prisma.project.create({
            data: {
                name,
                config
            }
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Create Error:', error);
        return NextResponse.json(
            { error: 'Naya tour create karne mein dikkat aayi' },
            { status: 500 }
        );
    }
}
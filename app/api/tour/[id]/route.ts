import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const project = await prisma.project.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                config: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Tour project nahi mila' },
                { status: 404 }
            );
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json(
            { error: 'Data fetch karne mein dikkat aayi' },
            { status: 500 }
        );
    }
}

// 2. POST / PUT: Tour create ya update karne ke liye
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, config } = body;

        if (!config) {
            return NextResponse.json(
                { error: 'Config data required hai' },
                { status: 400 }
            );
        }

        const updatedProject = await prisma.project.upsert({
            where: { id },
            update: {
                ...(name && { name }),
                config: config,
            },
            create: {
                id,
                name: name || 'Untitled Tour',
                config: config,
            },
        });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error('Save Error:', error);
        return NextResponse.json(
            { error: 'Data save karne mein dikkat aayi' },
            { status: 500 }
        );
    }
}
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, config } = body

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        settings: config?.settings || {},
        scenes: {
          create: config?.scenes?.map((scene) => ({
            name: scene.name,
            slug: scene.name.toLowerCase().replace(/ /g, '-'),
            imageUrl: scene.imageUrl,
            initialViewParameters: scene.initialViewParameters || {},
            hotspots: {
              create: scene.hotspots?.map((hs) => ({
                title: hs.title,
                text: hs.text || null,
                yaw: hs.yaw,
                pitch: hs.pitch,
                fov: hs.fov || null,
                type: hs.type,
                targetSceneId: hs.targetSceneId || null,
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        scenes: {
          include: {
            hotspots: true,
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        scenes: {
          include: {
            hotspots: true,
          },
        },
      },
    })

    return NextResponse.json(projects[0], { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface HotspotInput {
  title: string
  text?: string | null
  yaw: number
  pitch: number
  fov?: number | null
  type: string
  targetSceneId?: string | null
}

interface SceneInput {
  name: string
  imageUrl: string
  initialViewParameters?: Record<string, any>
  hotspots?: HotspotInput[]
}

export async function POST(req: NextRequest) {
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
          create: config?.scenes?.map((scene: SceneInput) => ({
            name: scene.name,
            slug: scene.name.toLowerCase().replace(/ /g, '-'),
            imageUrl: scene.imageUrl,
            initialViewParameters: scene.initialViewParameters || {},
            hotspots: {
              create: scene.hotspots?.map((hs: HotspotInput) => ({
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
    const err = error as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
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
    const err = error as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all contacts for user
export async function GET(request: NextRequest) {
  // For demo, return mock data
  // In production, get user from session and query database

  const mockContacts = [
    {
      id: '1',
      name: 'Mom',
      tier: 'inner_circle',
      contact_frequency_days: 3,
      contact_method: 'Call',
      last_contact_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom',
      platforms: [],
    },
    {
      id: '2',
      name: 'Bo Kim',
      tier: 'inner_circle',
      contact_frequency_days: 30,
      contact_method: 'Text',
      last_contact_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bokim',
      platforms: ['discord'],
    },
    {
      id: '3',
      name: 'Nana',
      tier: 'inner_circle',
      contact_frequency_days: 30,
      contact_method: 'Text or Call',
      last_contact_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nana',
      platforms: [],
    },
    {
      id: '4',
      name: 'Johnson Anumah',
      tier: 'inner_circle',
      contact_frequency_days: 60,
      contact_method: 'Text or Call',
      last_contact_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johnson',
      platforms: ['github', 'discord'],
    },
    {
      id: '5',
      name: 'Dad',
      tier: 'inner_circle',
      contact_frequency_days: 3,
      contact_method: 'Call',
      last_contact_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dad',
      platforms: [],
    },
  ]

  return NextResponse.json({ contacts: mockContacts })
}

// POST - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tier, contact_frequency_days, contact_method } = body

    if (!name || !tier) {
      return NextResponse.json({ error: 'Name and tier are required' }, { status: 400 })
    }

    // In production, save to database
    const newContact = {
      id: Date.now().toString(),
      name,
      tier,
      contact_frequency_days: contact_frequency_days || 30,
      contact_method: contact_method || 'Text',
      last_contact_at: null,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(/\s/g, '')}`,
      platforms: [],
    }

    return NextResponse.json({ contact: newContact }, { status: 201 })
  } catch (err) {
    console.error('Error creating contact:', err)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}

// PUT - Update a contact (log contact, update details)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    // In production, update in database
    // For now, just return the updated contact
    return NextResponse.json({
      contact: {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('Error updating contact:', err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

// DELETE - Remove a contact
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
  }

  // In production, delete from database
  return NextResponse.json({ success: true })
}

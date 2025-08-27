import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Call the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/user/entities/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { success: false, message: 'Failed to get user entities status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'User entities status retrieved successfully',
      data: data
    })

  } catch (error) {
    console.error('Get user entities status error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
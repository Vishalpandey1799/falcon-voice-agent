import { NextRequest, NextResponse } from 'next/server';

 
let worldState: any = null;

export async function GET() {
  return NextResponse.json(worldState || {});
}

export async function POST(request: NextRequest) {
  try {
    const newState = await request.json();
    worldState = newState;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
   
    const projectRoot = path.resolve(process.cwd(), '..')
    const filePath = path.join(projectRoot, 'backend', 'order_summary.json')

    console.log('Looking for order file at:', filePath)
    console.log('CWD:', process.cwd())
    console.log('Project root:', projectRoot)
    console.log('File exists:', fs.existsSync(filePath))

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'No order found', path: filePath },
        { status: 404 }
      )
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const order = JSON.parse(raw)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error reading order:', error)
    return NextResponse.json(
      { error: 'Failed to read order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

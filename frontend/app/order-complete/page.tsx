import fs from 'fs'
import path from 'path'
import React from 'react'
import OrderSummaryTable from '../../components/order/OrderSummaryTable'

async function readOrderJson() {
  try {
    const projectRoot = path.resolve(process.cwd(), '..')
    const filePath = path.join(projectRoot, 'backend', 'order_summary.json')
    
    console.log('Reading order from:', filePath)
    
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist at:', filePath)
      return null
    }
    
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading order:', e)
    return null
  }
}

export default async function OrderCompletePage() {
  const order = await readOrderJson()

  return (
    <main className="min-h-screen py-10 bg-background">
      <div className="container mx-auto px-4">
        {order ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-2">Order Summary</h1>
              <p className="text-muted-foreground">Your coffee order has been placed successfully!</p>
            </div>
            <OrderSummaryTable order={order} />
          </>
        ) : (
          <div className="p-8 bg-muted rounded-md border border-border max-w-xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-2 text-foreground">No order found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              There is no saved order yet. Place an order through the chat and come back here to see the summary.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              ← Back to Chat
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

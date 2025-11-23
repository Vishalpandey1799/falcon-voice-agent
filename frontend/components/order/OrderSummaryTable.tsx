'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type OrderData = {
  id?: number
  drinkType?: string
  size?: string
  milk?: string
  extras?: string[] | string
  name?: string
  timestamp?: string
}

export default function OrderSummaryTable({ order, showRedirectButton = false }: { order: OrderData; showRedirectButton?: boolean }) {
  const router = useRouter()

  // Auto-redirect to order-complete page after 2 seconds
  useEffect(() => {
    if (order && showRedirectButton) {
      const timer = setTimeout(() => {
        router.push('/order-complete')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [order, showRedirectButton, router])
  if (!order) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 shadow-lg">
        <p className="text-sm text-gray-400">No order found.</p>
      </div>
    )
  }

  // Handle extras as either array or string
  const extrasDisplay = Array.isArray(order.extras)
    ? order.extras.join(', ')
    : order.extras || 'None'

  const orderTime = order.timestamp ? new Date(order.timestamp).toLocaleTimeString() : 'Unknown'

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">☕</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
            <p className="text-sm text-gray-400 mt-1">Your coffee is being prepared</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Order Time</span>
          <p className="text-white font-medium mt-1">{orderTime}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-850 shadow-inner">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200">
              <td className="py-4 px-6 font-semibold text-gray-300 w-2/5 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400">👤</span>
                </div>
                Customer
              </td>
              <td className="py-4 px-6 text-white font-medium bg-gray-800/30">{order.name ?? '—'}</td>
            </tr>

            <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200">
              <td className="py-4 px-6 font-semibold text-gray-300 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-amber-400">☕</span>
                </div>
                Drink
              </td>
              <td className="py-4 px-6 text-white font-medium bg-gray-800/30">{order.drinkType ?? '—'}</td>
            </tr>

            <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200">
              <td className="py-4 px-6 font-semibold text-gray-300 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">📏</span>
                </div>
                Size
              </td>
              <td className="py-4 px-6 text-white font-medium bg-gray-800/30">{order.size ?? '—'}</td>
            </tr>

            <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200">
              <td className="py-4 px-6 font-semibold text-gray-300 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-orange-400">🥛</span>
                </div>
                Milk
              </td>
              <td className="py-4 px-6 text-white font-medium bg-gray-800/30">{order.milk ?? '—'}</td>
            </tr>

            <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-200">
              <td className="py-4 px-6 font-semibold text-gray-300 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400">✨</span>
                </div>
                Extras
              </td>
              <td className="py-4 px-6 text-white font-medium bg-gray-800/30">{extrasDisplay}</td>
            </tr>

            <tr className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200">
              <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400">⏱️</span>
                </div>
                Ready in
              </td>
              <td className="py-4 px-6 text-white font-bold text-lg bg-transparent">5 minutes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
          onClick={() => window.print()}
        >
          <span className="text-lg">🖨️</span>
          Print Receipt
        </button>
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-gray-500/25 hover:scale-105 active:scale-95 border border-gray-600"
          onClick={() => router.back()}
        >
          <span className="text-lg">🔄</span>
          New Order
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">Thank you for your order! Your coffee will be ready shortly.</p>
      </div>
    </div>
  )
}
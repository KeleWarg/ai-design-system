'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin account settings</p>
      </div>
      
      {/* Change Password */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-foreground mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              required
              disabled={loading}
              minLength={8}
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              required
              disabled={loading}
              minLength={8}
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
      
      {/* Environment Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Environment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Node Environment:</span>
            <span className="text-foreground font-mono">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Supabase Configured:</span>
            <span className="text-foreground">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">OpenAI Configured:</span>
            <span className="text-foreground">
              {process.env.OPENAI_API_KEY ? '✅ Yes' : '❌ No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}



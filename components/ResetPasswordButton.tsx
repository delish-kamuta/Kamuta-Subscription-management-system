import { useState } from 'react'
import { useAppSelector } from '~/store/hooks'
import { ensureValidTokenOrMessage, authFetch } from '~/lib/api'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { Input } from '~/components/ui/input'

export default function ResetPasswordButton() {
  const { user } = useAppSelector((s) => s.auth)
  const [open, setOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async () => {
    try {
      setError(''); setSuccess('')
      const tokenError = ensureValidTokenOrMessage()
      if (tokenError) { setError(tokenError); return }
      if (!user?.id) { setError('Missing user id'); return }
      if (!newPassword) { setError('New password is required'); return }
      setSubmitting(true)
      const resp = await authFetch('https://restaurant-bn-api.onrender.com/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, old_password: oldPassword, new_password: newPassword }),
      })
      if (!resp.ok) {
        let msg = 'Failed to reset password'
        try { const j = await resp.json(); msg = j.message || msg } catch { /* ignore */ }
        setError(msg); return
      }
      const data = await resp.json().catch(() => ({}))
      setSuccess(data?.message || 'Password reset successfully')
      setOldPassword(''); setNewPassword('')
      setTimeout(() => { setSuccess(''); setOpen(false) }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="ml-2">Reset Password</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white p-6 border-none h-screen max-h-screen overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Reset Password</SheetTitle>
            <SheetDescription>Update your password securely.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Old password</label>
              <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New secure password" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={onSubmit} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

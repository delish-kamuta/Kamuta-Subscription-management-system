import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { submitFeedback, type FeedbackType, type FeedbackRating } from '~/services/feedback'

interface FeedbackSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FeedbackSheet = ({ open, onOpenChange }: FeedbackSheetProps) => {
  const [type, setType] = useState<FeedbackType | string>('meal_quality')
  const [rating, setRating] = useState<FeedbackRating | string>('GOOD')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const reset = () => {
    setType('meal_quality')
    setRating('GOOD')
    setMessage('')
    setIsAnonymous(false)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true); setError(''); setSuccess('')
      if (!message.trim()) {
        setError('Please provide a message')
        return
      }
      const res = await submitFeedback({
        type,
        rating,
        message: message.trim(),
        is_anonymous: isAnonymous,
      })
      if (!res.success) {
        setError(res.message || 'Failed to submit feedback')
        return
      }
      setSuccess('Thanks for your feedback!')
      // Optional: close after short delay
      setTimeout(() => { onOpenChange(false); reset(); }, 800)
    } catch (e: any) {
      setError(e?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <SheetContent side='right' className='w-full sm:max-w-lg bg-white p-6 border-none h-screen max-h-screen overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Send Feedback</SheetTitle>
          <SheetDescription>We appreciate your thoughts to improve our service.</SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Type</label>
              <select className='w-full border rounded-md px-3 py-2' value={type} onChange={(e) => setType(e.target.value)}>
                <option value='meal_quality'>Meal quality</option>
                <option value='service_speed'>Service speed</option>
                <option value='staff_behavior'>Staff behavior</option>
                <option value='cleanliness'>Cleanliness</option>
                <option value='other'>Other</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Rating</label>
              <select className='w-full border rounded-md px-3 py-2' value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value='POOR'>Poor</option>
                <option value='AVERAGE'>Average</option>
                <option value='GOOD'>Good</option>
                <option value='EXCELLENT'>Excellent</option>
              </select>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Message</label>
            <textarea
              className='w-full border rounded-md px-3 py-2 min-h-[120px]'
              placeholder='The food was delicious and well prepared'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <label className='inline-flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            Submit as anonymous
          </label>

          {error && <p className='text-sm text-red-600'>{error}</p>}
          {success && <p className='text-sm text-green-600'>{success}</p>}

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className='bg-blue-600 text-white disabled:opacity-60' disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Sending…' : 'Send Feedback'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default FeedbackSheet

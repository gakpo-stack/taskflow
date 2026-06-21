import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useTrialPlan(userId) {
  const [plan, setPlan] = useState('free')
  const [trialDaysLeft, setTrialDaysLeft] = useState(null)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    initPlan()
  }, [userId])

  async function initPlan() {
    let { data } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!data) {
      const { data: newPlan } = await supabase
        .from('user_plans')
        .insert({ user_id: userId, plan: 'free', trial_started_at: new Date().toISOString() })
        .select().single()
      data = newPlan
    }

    if (data) {
      const trialStart = new Date(data.trial_started_at)
      const now = new Date()
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
      const daysLeft = Math.max(0, 7 - daysPassed)
      const trialActive = daysLeft > 0

      setPlan(data.plan)
      setTrialDaysLeft(daysLeft)
      setIsTrialActive(trialActive)
    }
    setLoading(false)
  }

  const isPro = plan === 'pro' || isTrialActive

  return { plan, trialDaysLeft, isTrialActive, isPro, loading }
}

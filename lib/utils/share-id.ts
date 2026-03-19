import { nanoid } from 'nanoid'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function generateUniqueShareId(supabase: SupabaseClient): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const id = nanoid(12)
    const { data } = await supabase.from('words').select('id').eq('share_id', id).single()
    if (!data) return id
  }
  return nanoid(16)
}

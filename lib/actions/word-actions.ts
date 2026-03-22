'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateUniqueShareId } from '@/lib/utils/share-id'

export async function addWord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const text = (formData.get('text') as string).trim()
  if (!text) throw new Error('言葉は必須です')

  await supabase.from('words').insert({
    user_id: user.id,
    text,
    author: (formData.get('author') as string | null)?.trim() ?? '',
    memo: (formData.get('memo') as string | null)?.trim() ?? '',
  })

  revalidatePath('/')
}

export async function updateWord(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const text = (formData.get('text') as string).trim()
  if (!text) throw new Error('言葉は必須です')

  await supabase.from('words').update({
    text,
    author: (formData.get('author') as string | null)?.trim() ?? '',
    memo: (formData.get('memo') as string | null)?.trim() ?? '',
  }).eq('id', id).eq('user_id', user.id)

  revalidatePath('/')
}

export async function deleteWord(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('words').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/')
}

export async function toggleWordPublic(wordId: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const shareId = isPublic ? await generateUniqueShareId(supabase) : null

  await supabase.from('words')
    .update({ is_public: isPublic, share_id: shareId })
    .eq('id', wordId)
    .eq('user_id', user.id)

  revalidatePath('/')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateUniqueShareId } from '@/lib/utils/share-id'
import { validateWord } from '@/lib/utils/word-validation'

function parseWordForm(formData: FormData) {
  const input = {
    text: ((formData.get('text') as string | null) ?? '').trim(),
    author: ((formData.get('author') as string | null) ?? '').trim(),
    memo: ((formData.get('memo') as string | null) ?? '').trim(),
  }
  const error = validateWord(input)
  if (error) throw new Error(error)
  return input
}

export async function addWord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const input = parseWordForm(formData)

  const { error } = await supabase.from('words').insert({
    user_id: user.id,
    ...input,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/')
}

export async function updateWord(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const input = parseWordForm(formData)

  const { error } = await supabase.from('words')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
}

export async function deleteWord(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('words')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
}

export async function toggleWordPublic(wordId: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const shareId = isPublic ? await generateUniqueShareId(supabase) : null

  const { error } = await supabase.from('words')
    .update({ is_public: isPublic, share_id: shareId })
    .eq('id', wordId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  return shareId
}

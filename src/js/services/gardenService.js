import { getSupabaseOrThrow } from '../config/supabase.js';

const FLOWERS = ['🌸', '🌷', '🌺', '🌼', '🪷', '💮', '🌻', '🌹'];

export async function getGardenProgress(userId) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('garden_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || { flowers_unlocked: 0, total_logs: 0 };
}

export async function updateGardenOnLog(userId) {
  const supabase = getSupabaseOrThrow();
  const current = await getGardenProgress(userId);
  const totalLogs = (current.total_logs || 0) + 1;
  const flowersUnlocked = Math.min(Math.floor(totalLogs / 3), FLOWERS.length);

  const { data, error } = await supabase
    .from('garden_progress')
    .upsert(
      {
        user_id: userId,
        total_logs: totalLogs,
        flowers_unlocked: flowersUnlocked,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function renderGarden(flowersUnlocked) {
  return FLOWERS.map((flower, i) => {
    const unlocked = i < flowersUnlocked;
    return `<div class="garden-flower${unlocked ? ' unlocked' : ''}" aria-label="${unlocked ? 'Flor desbloqueada' : 'Flor ainda não desbloqueada'}">${unlocked ? flower : '🌱'}</div>`;
  }).join('');
}

export function getGardenMessage(flowersUnlocked) {
  if (flowersUnlocked === 0) {
    return 'Seu jardim cresce junto com o conhecimento sobre seu ciclo.';
  }
  if (flowersUnlocked >= FLOWERS.length) {
    return 'Seu jardim está florescendo lindamente!';
  }
  return `${flowersUnlocked} flores já floresceram no seu jardim.`;
}

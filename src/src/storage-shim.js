import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkyymarjikshmrxuhius.supabase.co';
const supabaseKey = 'sb_publishable_L3wE7VA5Rj3B-kcYdG6x5g_h2ry0tth';

const supabase = createClient(supabaseUrl, supabaseKey);

window.storage = {
  async get(key, _shared) {
    const { data, error } = await supabase
      .from('kv_store')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Chave não encontrada: ' + key);
    return { key, value: data.value, shared: true };
  },

  async set(key, value, _shared) {
    const { error } = await supabase
      .from('kv_store')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw error;
    return { key, value, shared: true };
  },

  async delete(key, _shared) {
    const { error } = await supabase.from('kv_store').delete().eq('key', key);
    if (error) throw error;
    return { key, deleted: true, shared: true };
  },

  async list(prefix = '', _shared) {
    const { data, error } = await supabase
      .from('kv_store')
      .select('key')
      .like('key', `${prefix}%`);

    if (error) throw error;
    return { keys: (data || []).map((d) => d.key), prefix, shared: true };
  },
};

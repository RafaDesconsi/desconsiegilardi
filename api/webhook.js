import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  console.log('WEBHOOK CHAMADO:', req.method, JSON.stringify(req.body));
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        const phone = message.from;
        const name = value.contacts?.[0]?.profile?.name || 'Sem nome';
        const text = message.text?.body || '';

        const { data: existing } = await supabase
          .from('leads')
          .select('id')
          .eq('contato', phone)
          .maybeSingle();

        if (!existing) {
          await supabase.from('leads').insert({
            nome: name,
            contato: phone,
            nicho: 'WhatsApp',
            observacoes: text,
            column_id: 'novo_lead',
          });
        } else {
          await supabase
            .from('leads')
            .update({ observacoes: text })
            .eq('id', existing.id);
        }
      }

      return res.status(200).send('OK');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error');
    }
  }

  return res.status(405).send('Method not allowed');
}

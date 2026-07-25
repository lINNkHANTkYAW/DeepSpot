import { Router } from 'express';
import { getSupabaseClient } from '../services/supabase';

export function createSupabaseTestRouter(): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('todos').select('id').limit(1);

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }

      res.json({ ok: true, message: 'Supabase connection is healthy.', sample: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ ok: false, error: message });
    }
  });

  return router;
}

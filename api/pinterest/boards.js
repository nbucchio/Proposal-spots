// api/pinterest/boards.js
// ---------------------------------------------------------------------------
// Convenience route: GET /api/pinterest/boards lists the connected account's
// boards as JSON. Handy for confirming the token works and for grabbing a
// board_id to pass to /api/pinterest/publish.
// ---------------------------------------------------------------------------

import { listBoards } from '../../lib/pinterest.js';

export default async function handler(req, res) {
  try {
    const data = await listBoards(null, 100);
    const boards = (data.items || []).map((b) => ({
      id: b.id,
      name: b.name,
      privacy: b.privacy,
      pin_count: b.pin_count,
    }));
    return res.status(200).json({ count: boards.length, boards });
  } catch (err) {
    console.error('[pinterest/boards]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

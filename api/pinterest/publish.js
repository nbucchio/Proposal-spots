// api/pinterest/publish.js
// ---------------------------------------------------------------------------
// PHASE 2 route — the real publishing arm. Same wrapper as the sandbox test,
// but parametric: give it a title, description, image, link and board, and it
// creates the pin. This is what the weekly Pinterest batch (see the
// `proposal-spots-pinterest` skill) calls once Standard access is approved.
//
// It intentionally knows nothing about content strategy — it publishes exactly
// what it's handed.
//
// Accepts JSON POST (recommended) or GET query params:
//   board        board NAME (found or created) — or pass boardId to target one
//   boardId      optional explicit board id (skips the name lookup)
//   title        pin title
//   description  pin description
//   image        publicly reachable image URL   (required)
//   link         click-through URL
//
// Optional protection: if PINTEREST_PUBLISH_SECRET is set in the env, callers
// must send it as ?secret=... or an "x-publish-secret" header. This stops the
// live route from being triggered by anyone who guesses the URL.
// ---------------------------------------------------------------------------

import { findBoardByName, createBoard, createPin } from '../../lib/pinterest.js';

export default async function handler(req, res) {
  // Merge params from query string and JSON body (body wins).
  const src = { ...(req.query || {}), ...(req.body || {}) };

  // Optional shared-secret gate.
  const required = process.env.PINTEREST_PUBLISH_SECRET;
  if (required) {
    const provided = src.secret || req.headers['x-publish-secret'];
    if (provided !== required) {
      return res.status(401).json({ error: 'Unauthorized: missing or wrong publish secret.' });
    }
  }

  const {
    board,
    boardId,
    title,
    description,
    link,
    image,       // preferred name
    imageUrl,    // also accepted
  } = src;

  const finalImage = imageUrl || image;

  if (!finalImage) {
    return res.status(400).json({ error: 'Missing required field: image (a public image URL).' });
  }
  if (!boardId && !board) {
    return res.status(400).json({ error: 'Provide either boardId or board (board name).' });
  }

  try {
    // Resolve the board: explicit id, or find-by-name, or create it.
    let targetBoardId = boardId;
    let boardName = board;
    if (!targetBoardId) {
      let boardObj = await findBoardByName(board, null);
      if (!boardObj) {
        boardObj = await createBoard({ name: board, privacy: 'PUBLIC' }, null);
      }
      targetBoardId = boardObj.id;
      boardName = boardObj.name;
    }

    const pin = await createPin({
      boardId: targetBoardId,
      title,
      description,
      link,
      imageUrl: finalImage,
      altText: title,
    }, null);

    return res.status(200).json({
      success: true,
      pin_id: pin.id,
      pin_url: `https://www.pinterest.com/pin/${pin.id}/`,
      board_id: targetBoardId,
      board_name: boardName,
    });
  } catch (err) {
    console.error('[pinterest/publish]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

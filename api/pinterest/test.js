// api/pinterest/test.js
// ---------------------------------------------------------------------------
// THE PROOF ROUTE — this is what Pinterest's review team needs to see working.
//
// Hitting /api/pinterest/test will:
//   1. find or create a board called "Bali" (idempotent — reused if it exists),
//   2. create one real pin in it with a realistic title/description + image,
//   3. show a confirmation page linking straight to the created pin on Pinterest.
//
// During Trial access this publishes to your own account only — perfect for the
// Standard-access demo video. After Standard approval, the SAME wrapper powers
// /api/pinterest/publish for real content.
//
// Requires PINTEREST_ACCESS_TOKEN in the environment (complete the OAuth flow at
// /api/pinterest/connect first, then paste tokens into Vercel and redeploy).
// ---------------------------------------------------------------------------

import { findBoardByName, createBoard, createPin } from '../../lib/pinterest.js';

// Sandbox content. Realistic, on-brand Proposal Spots copy — but you can override
// any of it with query params (?board=&title=&image=&link=) when testing.
const DEFAULTS = {
  board: 'Bali',
  boardDescription: 'Dreamy proposal spots in Bali — curated by Proposal Spots.',
  title: 'How to Propose in Bali: Clifftop & Beach Spots',
  description:
    'Planning a Bali proposal? From Uluwatu clifftops to hidden beach coves, ' +
    'here are the most romantic spots to pop the question in Bali. ' +
    'Curated proposal locations at proposalspots.com.',
  image:
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1000&auto=format&fit=crop',
  link: 'https://proposalspots.com/destinations/bali',
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page(title, bodyHtml) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
         max-width: 720px; margin: 40px auto; padding: 0 20px; color: #222; line-height: 1.5; }
  h1 { font-size: 22px; } h2 { font-size: 15px; margin-top: 24px; }
  pre { background: #f5f5f5; border: 1px solid #e2e2e2; border-radius: 8px;
        padding: 12px; overflow-x: auto; font-size: 13px; }
  .ok  { background: #e9f7ee; border: 1px solid #b7e2c4; border-radius: 8px; padding: 12px 14px; }
  .err { background: #fdecec; border: 1px solid #f3b5b5; border-radius: 8px; padding: 12px 14px; }
  img.preview { max-width: 260px; border-radius: 10px; margin-top: 8px; }
  a.btn { display: inline-block; background: #c26e5a; color: #fff; text-decoration: none;
          padding: 10px 16px; border-radius: 8px; margin-top: 12px; }
</style></head><body>${bodyHtml}</body></html>`;
}

export default async function handler(req, res) {
  const q = req.query || {};
  const board = q.board || DEFAULTS.board;
  const title = q.title || DEFAULTS.title;
  const description = q.description || DEFAULTS.description;
  const image = q.image || DEFAULTS.image;
  const link = q.link || DEFAULTS.link;

  try {
    // 1. Find or create the board (idempotent so re-running doesn't pile up dupes).
    let boardObj = await findBoardByName(board, null);
    let boardCreated = false;
    if (!boardObj) {
      boardObj = await createBoard(
        { name: board, description: DEFAULTS.boardDescription, privacy: 'PUBLIC' },
        null
      );
      boardCreated = true;
    }

    // 2. Create the pin.
    const pin = await createPin({
      boardId: boardObj.id,
      title,
      description,
      link,
      imageUrl: image,
      altText: title,
    }, null);

    // 3. Confirmation. Link straight to the live pin — that's the visual proof.
    const pinUrl = `https://www.pinterest.com/pin/${pin.id}/`;
    res.status(200).setHeader('Content-Type', 'text/html');
    return res.end(page('Sandbox pin created', `
      <h1>✅ Pin created successfully</h1>
      <div class="ok">
        Board <strong>"${esc(boardObj.name)}"</strong> ${boardCreated ? 'created' : 'reused'}
        (id <code>${esc(boardObj.id)}</code>) and a pin was published to it.
      </div>

      <h2>Your live pin on Pinterest</h2>
      <p><a class="btn" href="${esc(pinUrl)}" target="_blank" rel="noopener">Open the pin ↗</a></p>
      <img class="preview" src="${esc(image)}" alt="pin image preview">

      <h2>What was published</h2>
      <pre>${esc(JSON.stringify({
        board_id: boardObj.id,
        pin_id: pin.id,
        title,
        description,
        link,
        image,
      }, null, 2))}</pre>

      <p style="color:#666;font-size:13px">
        Re-run any time. Override the content with query params, e.g.
        <code>?board=Bali&amp;title=...&amp;image=...&amp;link=...</code>
      </p>`));
  } catch (err) {
    console.error('[pinterest/test]', err.message);
    res.status(500).setHeader('Content-Type', 'text/html');
    return res.end(page('Test failed', `
      <h1>Sandbox test failed</h1>
      <div class="err">${esc(err.message)}</div>
      <p>Most likely the access token isn't set yet. Connect first:</p>
      <a class="btn" href="/api/pinterest/connect">Connect Pinterest</a>`));
  }
}

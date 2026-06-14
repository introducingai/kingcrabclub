# Kintara Companion Overlay Extension

Read-only browser extension MVP for `kintara.gg`.

## Safety model

- Does not click, buy, sell, reserve, cancel, or automate the game.
- Does not call Kintara marketplace write endpoints.
- Does not request wallet signatures, token approvals, private keys, or auth tokens.
- Reads from the companion dashboard API and stores watchlists/notes locally in browser storage.
- Degen DJ is a dock/link/iframe only.

## Local install

1. Run the companion dashboard at `http://localhost:3000`.
2. Open Chrome or Edge extensions.
3. Enable Developer Mode.
4. Click **Load unpacked**.
5. Select this `extension` folder.
6. Open `https://kintara.gg`.

Use the extension popup to change:

- Companion dashboard URL
- Degen DJ room URL

## MVP tabs

- **Market**: live read-only listing stats, top floors, biggest listings.
- **Watch**: local watched items and sellers.
- **Degen DJ**: embedded room dock plus a full-session extension page for background audio while playing.
- **Alpha**: local-only notes.

## Future safe improvements

- Package the Degen DJ static build directly into the extension once the room UI stabilizes.
- Add item-specific quick search from selected text.
- Add optional notification badges from local alert rules.
- Add a signed release build script.
- Add a companion-hosted extension config endpoint.

Any future feature that touches real Kintara account state must remain disabled until official auth/API permission exists.

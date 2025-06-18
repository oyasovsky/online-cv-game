# Online CV Game

This project is a futuristic personal CV website with an interactive game mode powered by OpenAI.

## Development

1. Install dependencies (requires Node 18):
   ```bash
   npm install
   ```
2. Add your OpenAI key to `.env`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Project Structure

- `pages/` – Next.js pages
- `pages/api/` – API routes
- `components/` – React components
- `public/` – static assets (including PDF CV)
- `styles/` – Tailwind CSS

The game mode lives at `/game` and uses `/api/chat` to talk to OpenAI.

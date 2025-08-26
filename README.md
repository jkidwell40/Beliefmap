# Belief Map (Circular Phylogeny)

A belief‑mapping tool with AI coherence checks, circular phylogeny layout, and Netlify Functions for server‑side evaluation.

## Stack
- React + TypeScript + Vite
- React Flow (graph)
- Tailwind CSS
- Zustand (state)
- Netlify Functions (`analyze`, `suggest`)
- (Optional) Claude for evaluation

## Quickstart

```bash
npm i
cp .env.example .env     # optional for local mock
npm run dev
```

Open http://localhost:5173

### Environment Variables
- **Client (Vite)**: `VITE_USE_MOCK=1` will use a local mock analyzer.
- **Netlify Functions**:
  - `USE_MOCK=1` mock responses in Functions
  - `CLAUDE_API_KEY` (required for live evaluation)
  - `CLAUDE_MODEL` (optional, default `claude-3-5-sonnet-20240620`)

### Deploy to Netlify
1. Push this repo to GitHub.
2. Create a Netlify site from the GitHub repo.
3. Set env vars in Netlify UI:
   - `CLAUDE_API_KEY` (required for live)
   - `CLAUDE_MODEL` (optional)
   - `USE_MOCK=0` (or leave unset)  
4. Deploy (Netlify runs `npm run build`).

## Modes
- **Sandbox**: Add + Suggest + Undo; AI-managed layout; flagged nodes allowed.
- **Professional**: No Undo, no Suggest; flagged node blocks new input until revised.

## Notes
- Core node is protected, centered, and never analyzed.
- Circular layout uses D3 `cluster()` (angles) + concentric rings by depth.

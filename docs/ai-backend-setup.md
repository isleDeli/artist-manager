# AI grant writer — temporary public demo

Artists now use Draft application without entering backend URLs, access codes or provider configuration. OPENAI_API_KEY remains private on the Render server.

## Deploy the update before the demo

1. Open the artist-manager-grant-writer service in the Render dashboard.
2. Select Manual Deploy → Deploy latest commit.
3. Wait until the service is Live.
4. Check https://artist-manager-grant-writer.onrender.com/health — it should report status ok, configured true and publicDemo true.
5. Refresh the website. In an application workspace, fill the question/description, select the portfolio context, approve using it and click Draft application.

No environment change is required for the existing service: the updated server defaults PUBLIC_DEMO_MODE to true. If you previously set PUBLIC_DEMO_MODE=false, set it to true in Render. Keep the existing OPENAI_API_KEY; no key belongs in the browser or chat. Any existing GRANT_WRITER_ACCESS_CODE can remain on the server but is not used in public demo mode.

## Usage and limits

Requests are billed to the owner's OpenAI API account. Public mode checks the frontend origin, admits one generation at a time and at most five per minute, and defaults to 25 requests per UTC day per running instance (PUBLIC_DEMO_DAILY_LIMIT). These in-memory counters reset when the service restarts; they are not a guaranteed billing cap or production user authentication.

Set PUBLIC_DEMO_MODE=false to restore server access-code enforcement later; the simplified frontend will also need a suitable authentication flow for that mode.

The server preserves word limits, strict output/coverage checks, missing-fact questions, provider errors and no automatic paid retries. Existing drafts are only changed when the artist inserts/appends or explicitly replaces text.

The full successful writing flow still needs a live request after deployment. Unit/integration tests use mocked provider responses; no browser test or successful live AI generation is claimed.

Official references: https://developers.openai.com/api/docs/guides/structured-outputs and https://render.com/docs/deploys

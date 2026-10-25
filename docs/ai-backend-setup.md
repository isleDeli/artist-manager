# Live AI grant writer: backend setup

The GitHub Pages website now includes an AI writing panel in every application workspace. The Node backend is implemented in server/ but cannot run on GitHub Pages. Deploy it on Render, then connect its public URL in the app.

## 1. Deploy the backend

[Deploy this backend to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FisleDeli%2Fartist-manager)

Sign in to Render and review the blueprint from isleDeli/artist-manager. It creates one **Free** web service; no database is needed.

Render will ask for two private environment values:

- **OPENAI_API_KEY:** enter your OpenAI API key directly in Render. Create/manage keys at https://platform.openai.com/api-keys . Never paste the key into chat, GitHub source, an issue, or the website.
- **GRANT_WRITER_ACCESS_CODE:** choose a separate private access code of at least 16 characters (a password manager can generate one). This is NOT your OpenAI API key. You will enter this access code in the website when requesting drafts. Keep it out of chat and source control.

The blueprint sets OPENAI_MODEL=gpt-5.6-terra and ALLOWED_ORIGIN=https://isledeli.github.io. The model can be changed in Render if your OpenAI project uses another Responses/structured-output-compatible model. API usage is billed to the OpenAI account. Ensure API billing and model access are enabled for that project.

Choose **Deploy**. Wait for the service status to become **Live**, then copy its public HTTPS URL from Render. The service name may have a suffix; use the URL Render actually displays.

If you already created the service manually, open its **Environment** settings and set the same variables. Build command: npm ci --omit=dev. Start command: node server/index.mjs. Health check: /health.

## 2. Connect the website

1. Open https://isledeli.github.io/artist-manager/#/portfolio and load Taylor's demo portfolio, or use your own profile.
2. Go to Discover, open an opportunity and start an application.
3. In its workspace, open **AI grant writer → Connect your AI backend**.
4. Paste the public backend URL. Enter the separate GRANT_WRITER_ACCESS_CODE in the access-code field. **Never enter your OpenAI API key in the website.**
5. Select **Check connection**. A free Render instance can need about a minute to wake after being idle; retry the connection check if necessary.
6. Add the actual application question, opportunity description/selection criteria and your desired word limit. The default 500 words is a drafting target, not an official limit.
7. Review the selected facts and work samples, then approve sending this information to the backend and OpenAI.
8. Select **Plan and draft this answer**. Review the writing plan, proposed text, requirement coverage, gaps and warnings. Insert/append it, or explicitly replace an existing answer.

The backend URL is public and may be shared for connection help. Keep both the OpenAI key and backend access code private.

## What the writer does

The professional arts grant-writing instructions ask for clear, specific, first-person prose grounded only in supplied artist/project facts. Every known met requirement is reviewed: its coverage row is either addressed with supporting fact IDs and an exact draft excerpt, or not addressed. Unknown/unmet requirements cannot become supported coverage claims. Additional pasted guidelines are reference material, not independently verified rules.

Missing project facts produce questions and clearly marked placeholders, not invented plans, achievements or budgets. Source caveats, incomplete eligibility review and demo information remain visible. The artist must verify all claims; structural coverage checks cannot prove the truth of generated prose or guarantee funding.

Only selected text and sample metadata are sent. Original artwork files/images and the contents of linked websites/CVs are not fetched or sent. The backend uses Responses API store:false and does not log submitted text or keys. Existing browser drafts are not replaced automatically.

## Demo service limits

The backend requires the private access code, checks the frontend origin, limits request/response size, admits one request at a time and at most five per minute per instance, and times out long provider requests. It does not automatically retry paid generations.

The Free Render instance sleeps after inactivity and has other service limits. It is suitable for a demo; these access-code and in-memory limits are not a production multi-user account system. Service restarts reset in-memory admission limits. No paid Render plan is selected by the blueprint.

## Local development

Use Node 22.12+ (Node 24 is supported). Copy .env.example to an ignored .env file in your own terminal and enter the two secrets there; never commit it.

Run npm run start:backend in one terminal and npm run dev in another. In the app, use http://127.0.0.1:8787 as the backend URL. The server allows the local Vite origin only outside NODE_ENV=production.

## Validation and remaining setup

Unit and HTTP integration tests use mocked provider responses; they cover request validation, authentication, CORS, usage limits, output/refusal/incomplete handling, evidence links and word limits. No live OpenAI generation has been performed without the account owner's server-side key and backend deployment. Writing quality must still be reviewed using actual application material.

Official references:
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/migrate-to-responses
- https://developers.openai.com/api/docs/models/gpt-5.6-terra
- https://render.com/docs/deploy-to-render
- https://render.com/docs/blueprint-spec
- https://render.com/docs/free

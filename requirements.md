# Art Manager Requirements

Status: initial agreed behavior specification; implementation has not started.
Source review date: 2026-10-24. Grant summaries below are dated observations, not complete eligibility certifications.

## Purpose and Scope

Art Manager is a web application for Bay Area visual artists to discover a small, manually verified catalog of real grants and residencies, understand eligibility, prepare editable application drafts, and track deadlines and application progress.

The first version covers one journey: artist profile → opportunity matches → application draft → saved deadline and status. OpenAI Codex builds the application; Kane CLI generates and executes reusable requirement-linked tests and supplies evidence for fixes.

Storefront discovery, owner outreach, automatic submission, scraping, and reminders are deferred. The initial catalog is curated rather than continuously updated automatically. Accounts and cross-device synchronization are not required for the first demo.

## Artist Profile

PRO-01: Artists can create and edit their discipline, location, and career stage.
PRO-02: Matching can request additional information needed by an opportunity, including county, fiscal sponsorship, exhibition history, years of mature practice, student enrollment, project dates, and funding purpose. Missing information remains unknown rather than being inferred.
PRO-03: Editing a profile recalculates opportunity eligibility and explanations without deleting saved drafts or application progress.

## Opportunity Catalog and Provenance

CAT-01: Each record includes its name, provider, opportunity type, official URL, source-review date, verified rules, application materials, and known deadline information. Unverified fields are explicitly identified.
CAT-02: Funding opportunities are separate from guidance for existing grantees. Reference resources do not appear as application opportunities.
CAT-03: Records preserve published deadline dates, times, and time zones. Missing times, conflicting dates, stale cycle announcements, and unpublished prompts remain unresolved; the application does not invent replacements.
CAT-04: Availability is displayed separately as open, upcoming, closed, rolling, or uncertain. A matching artist can meet eligibility rules while an application window is closed.
CAT-05: Catalog records expose source links and verification gaps. Review of a summary page alone does not establish that every eligibility requirement has been checked.

## Eligibility and Recommendations

ELI-01: Each opportunity displays eligible, ineligible, or uncertain and a plain-language explanation linked to the applicable official requirements.
ELI-02: A verified unmet mandatory condition yields ineligible. If no mandatory condition is known to fail but required artist information or rule verification is missing, the result is uncertain. Eligible requires that all mandatory conditions for the relevant cycle have been verified and satisfied; it does not promise an award.
ELI-03: Explanations identify satisfied conditions, failed conditions, and unresolved details as applicable. An uncertain result identifies the information or source clarification needed.
ELI-04: Eligibility accounts for funding purpose and specific restrictions, not only location and broad artistic discipline. Ineligible opportunities remain inspectable with their explanation and are not presented as eligible recommendations.

## Application Assistance

APP-01: Artists can prepare editable draft answers using their own profile and project information and verified opportunity-specific questions.
APP-02: The assistant flags missing facts and required materials instead of inventing achievements, qualifications, references, project details, or funder questions. Unpublished questions are labeled unavailable.
APP-03: Artists can edit, save, reopen, and continue drafts associated with a particular opportunity. Editing or regenerating a draft must preserve saved user work unless the artist explicitly chooses to replace it.
APP-04: Opportunity checklists distinguish completed and missing materials. Drafting and checklist completion do not submit an application to a funder.

## Deadlines and Application Tracking

TRK-01: Artists can save opportunities and set an application status: interested, drafting, submitted, accepted, or declined.
TRK-02: Status records are artist-entered progress, not confirmation from the funding organization. Changing status preserves the associated draft.
TRK-03: Deadline displays retain the original time zone and distinguish rolling deadlines, unknown times, upcoming windows, and closed cycles. An unspecified time is never silently interpreted as midnight.
TRK-04: Saved profiles, opportunities, drafts, and statuses remain after refreshing and reopening the application in the same browser. Cross-device persistence is outside the initial scope.

## Dated Real-World Requirement References

These records anchor requirements; they are not hand-authored test cases. Complete guidelines must be reviewed before a record can support an eligible determination.

### East Bay Fund for Artists 2026

Source: https://www.ebcf.org/initiatives/east-bay-fund-for-artists/
Application portal: https://eastbaycf.smapply.io/prog/east_bay_fund_for_artists_2026/
Observed: application window open; published deadline October 26, 2026, 5 p.m. Pacific. Individual applicants must live in Alameda or Contra Costa County and supply a signed fiscal sponsorship agreement. New work, an East Bay presentation, artist-fee restrictions, previous-award restrictions, and a funding limit of 75% of project budget also matter. The page contains weekday/date inconsistencies; preserve and flag them rather than correcting the source silently.
Requirement relevance: county and sponsorship checks, additional mandatory rules, project purpose, and precise deadline handling.

### Pollock-Krasner Foundation

Source: https://www.pkf.org/how-to-apply/
Observed: rolling applications for professional painters, sculptors, and artists working on paper; at least ten qualifying exhibitions within the past ten years. Primarily photography and video practices are excluded, alongside other published exclusions and reapplication restrictions.
Requirement relevance: detailed discipline and exhibition-history matching; profile updates; rolling availability.

### Gottlieb Individual Support Grant

Source: https://www.gottliebfoundation.org/individual-support-grant-1
Observed: 2027 cycle opens October 15, 2026; deadline January 15, 2027. Source lists 11:59 Eastern without specifying a.m. or p.m. Individual painters, sculptors, and printmakers need at least twenty years of mature practice and financial need; additional exclusions apply.
Requirement relevance: years of practice, missing financial information, and unresolved deadline precision.

### Gottlieb Emergency Grant

Source: https://www.gottliebfoundation.org/emergency-grant/
Observed: no application deadline. Intended for qualified painters, sculptors, and printmakers with at least ten years of mature practice facing a qualifying unforeseen catastrophic emergency. Ordinary project funding, unemployment, and general indebtedness are not covered. Availability can depend on remaining program funds.
Requirement relevance: emergency purpose, mature-practice history, and distinction from ordinary project grants.

### Hopper Prize and Artist Grant

Sources: https://hopperprize.org/ and https://artistgrant.org/apply
Observed: visual-artist funding leads with application fees. Hopper deadline listings conflict and its reviewed main page does not establish an exact deadline. Artist Grant has stale July instructions alongside November deadline messaging.
Requirement relevance: explicit fees, conflicting source information, and uncertain current application windows. Do not treat search snippets as authoritative deadlines.

## Kane Verification Workflow

QA-01: Use this document as the requirement source. Kane assurance commands ingest requirements, extract use cases for review, and generate reusable tests; do not hand-write executable Kane test cases.
QA-02: Generated coverage must address onboarding, eligibility and explanation changes, missing information, draft preservation, deadline handling, and application-status persistence.
QA-03: Retain a dated snapshot of source rules for repeatable verification. Deadline-sensitive checks use a controlled reference date; current real-world availability is verified separately. Label synthetic artist data and any unverified catalog records clearly.
QA-04: Codex runs the generated suite, inspects failures and evidence, fixes issues, and reruns affected behavior. Preserve run reports, screenshots, and requirement coverage; do not claim a run or fix without supporting evidence.
QA-05: Kane generation and execution consume credits. The participant has agreed to this testing refinement; review generated use cases, tests, and required variables before execution.

## Open Implementation Decisions

- Choose the application framework and persistence mechanism while preserving same-browser saved data.
- Choose the application-drafting integration and document its configuration and failure behavior. Codex as the coding agent alone does not implement an in-app drafting assistant.
- Review detailed funder guidelines, exact application questions, and unresolved cycle/deadline conflicts before classifying opportunities as fully verified.
- Define residency records once their current application windows and rules have been verified; the grant examples do not establish residency-specific requirements.

## Catalog Expansion — User Request, 2026-10-24

CAT-06: Add the twenty real listings in src/data/additional-opportunities.json alongside the original four real listings, for 24 real records. Fictional opportunity records are excluded per the latest user request. Preserve source dates, fees, restrictions and uncertain/upcoming windows; do not infer eligibility from availability. See docs/additional-opportunities.md.

## Planned Feature: Live AI Application Drafting

Added at the user's request on 2026-10-24. This is a feature note, not an implemented capability. It expands the earlier frontend-only drafting plan; backend architecture, provider/model, deployment and operating costs remain to be chosen before implementation.

AI-01: In the application workspace, let the artist select portfolio information to use: bio, artist statement, experience, previous projects and relevant work samples. Use the selected opportunity's verified application questions, selection criteria, eligibility rules and word limits, together with the artist's proposed project, budget and timeline.
AI-02: Start with drafting one answer at a time. Keep the application question, word limit and relevant portfolio information visible beside the draft. Let the artist choose included materials and request a draft or revision.
AI-03: Ask for missing information or clearly flag gaps. Never invent qualifications, achievements, project facts, funder questions or word limits. Distinguish official requirements from the artist's own preparation notes.
AI-04: Generate editable answers and preserve user edits. Show revisions separately; replacing saved text requires the artist's explicit choice. Save drafts so the artist can continue later.
AI-05: Use a secure backend/serverless endpoint for live AI calls; keep provider API keys on the server. Explain which selected materials will be sent to the AI provider before a draft is requested. Usage incurs provider costs; configuration and spending controls need to be designed.
AI-06: Show loading, failure and retry states without losing existing text. Clearly label AI-generated drafts and require artist review. Application drafting never submits to the funder; the artist submits independently.

Implementation planning must reconcile this feature with the static-host frontend and existing local persistence. Live AI is not enabled in the current static design preview.

## Profile-Based Requirement Matching — 2026-10-24

MATCH-01: Replace the earlier fixed category weights with a requirement-based score. Compare the artist's saved profile and project information with each opportunity's verified eligibility/application conditions: discipline, location, career stage, practice history, sponsorship, project purpose and other stated conditions. Document uploads and drafting progress do not change artist fit.
MATCH-02: For each distinct applicable requirement, record met, not met or unknown, with a source and explanation. Score = round(100 × met / total applicable verified requirements). Unknown requirements remain in the denominator and earn no points; they are not labeled failures. Exclude confirmed non-applicable rules. Do not split equivalent rules to inflate their weight.
MATCH-03: Show the percentage alongside counts, e.g. "6 of 8 requirements met · 2 need information". No verified rules means "Match not assessed", not 0% or 100%. Incomplete rule verification means a provisional score based on reviewed requirements only. Even 100% of reviewed rules does not certify full eligibility or predict funding.
MATCH-04: A verified unmet mandatory requirement displays Not eligible and puts the opportunity below those with no known mandatory failures. Preserve the honest requirement percentage rather than applying the previous arbitrary 20-point cap. Eligibility remains a separate result.
MATCH-05: Discover defaults to Best match: assessed opportunities without known mandatory failures sorted by percentage descending, then fewer unknown requirements, then title for stable ties. Unassessed opportunities follow; known-ineligible opportunities come last and are sorted by score within that group. Keep availability visible and independent of fit; existing filters and alternate sorts remain available.
MATCH-06: Recalculate scores and Discover ordering when the artist updates their profile, project facts or requirement answers. Preserve saved applications and drafts. Clicking a score opens the met/not-met/unknown breakdown and identifies information needed to refine it.

This supersedes fixed 50/25/15/10 weights and the mandatory-failure score cap in prior design notes. Implementation is pending the application build; static preview scores remain labeled illustrations.

## Kane Verification Requirements: Profile Matching and Discover Ranking

These are acceptance requirements for Kane to ingest and generate tests from once the app is available, not handwritten executable test cases. Link generated coverage to MATCH-01 through MATCH-06 and the requirements below. Use controlled, explicitly labeled synthetic artist profiles and a dated snapshot of real opportunity rules, separate from the production catalog.

QA-MATCH-01: Verify score arithmetic, percentage rounding and displayed counts against independently specified expected values: six met out of eight applicable verified requirements yields 75%. Unknown answers earn no points but remain unknown; confirmed non-applicable rules are excluded and equivalent rules are not double-counted.
QA-MATCH-02: Verify that missing profile facts remain unknown rather than failed; incomplete rule review displays a provisional score; no verified rules displays Match not assessed without a fabricated numeric score. A 100% score must not claim guaranteed eligibility or funding.
QA-MATCH-03: Verify that a confirmed mandatory failure displays Not eligible, retains its actual percentage and ranks below opportunities without known mandatory failures, even when its percentage is higher. Availability labels remain independent of eligibility and score.
QA-MATCH-04: Verify Discover defaults to Best match, orders assessed non-ineligible opportunities by descending percentage, resolves ties by fewer unknowns then title, places unassessed records next and known-ineligible records last. Verify filters preserve the order of remaining results and alternate sorts remain usable.
QA-MATCH-05: Verify that saving changes to profile facts, project facts or requirement answers updates scores, explanations and Discover ordering. Verify the saved profile and derived ranking remain consistent after reload, with application drafts, bookmarks and statuses preserved.
QA-MATCH-06: Verify that opening a score reveals the met/not-met/unknown breakdown, source links and missing-information prompts, and that the displayed counts agree with the percentage. Verify keyboard access and readable text equivalents for the visual score.
QA-MATCH-07: Verify that uploading work samples, completing a checklist or editing a draft does not change artist fit unless an underlying profile or project fact used by a requirement changes.

Retain Kane's generated requirement links and evidence for these behaviors. Report actual coverage and failures, fix the implementation and rerun affected checks. Generation and execution have not been performed for this addition.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: capital partners and lenders** evaluating Vireilo Ventures as an enterprise to finance or partner with. They arrive to check who is behind the company, how it is structured, and whether it carries itself like an institution. (Confirmed 2026-11-20.)

## Product Purpose

vireilo.com is the public face of Vireilo Ventures, a holding company that acquires, develops, owns and operates businesses and real assets across the Midwest. The site is a brochure and a capital and deal-flow funnel: it establishes the enterprise, explains its structure and principles, and gives a serious visitor a way to make contact.

Success is a capital partner or lender leaving with a clear, credible picture of the enterprise and a reason to start a conversation.

## Positioning

"Own. Operate. Scale." A technology-enabled platform that owns both property companies and operating companies and runs them on shared systems. Not a passive holding company and not a pure real estate developer.

## Operating Context

- Pages: home, contact, SMS consent flow, privacy, terms, 404.
- The site links out to a separately gated private console. Nothing on the site carries company data, logins or internal systems.
- Contact and SMS consent use Netlify Forms. The privacy and terms pages carry the SMS disclosures that carrier registration requires.

## Capabilities and Constraints

- Hand-authored static HTML with no build step or framework. What is in the repository is what gets served.
- Assets are cached for a year, so a changed image needs a new filename.
- **Content rules**: no dollar figures; counts and years only. No returns, terms, or solicitation language of any kind. Positioning copy refers to "operating companies" and does not name individual brands. Tenant names for projects in development appear only with written clearance. No residential addresses.
- The education and community offering is a separate brand and does not appear on this site.
- **Undecided**: whether portfolio brands are named anywhere on the site or kept off it entirely. Which business mailing address the site should publish. Attorney review of the legal pages is still outstanding.

## Brand Commitments

- Name: Vireilo Ventures, a coined name from the Latin *virere*, to flourish.
- Voice: classy and reserved. Quiet confidence, fewer words, never explains or defends itself.
- The founder's basketball background is described only as: worked in the NBA for five years, intern to assistant video coordinator, four teams. No inflated titles.
- Mission, vision and the seven core values as written on the live home page.

## Evidence on Hand

- `assets/logo-nav.png`, `assets/logo-brand.png`, `assets/og.png`.
- The live copy on `index.html` (positioning, brand meaning, mission, vision, values, philosophy, structure).
- **Absent, do not fabricate**: financial figures, performance claims, testimonials, partner or lender logos, press.

## Product Principles

1. **Institutional posture.** The site should read as an enterprise a lender can underwrite, not a personal brand.
2. **Say less.** Restraint is the signal; every added claim has to earn its place.
3. **Nothing that could read as an offering.** Describe the enterprise; never pitch an investment.
4. **The site is a front door only.** It introduces and routes; the business itself lives elsewhere.

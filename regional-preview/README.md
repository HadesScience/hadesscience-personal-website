# Mainland China link filtering

This Worker is intended for a route on `hadesscience.com/*` in the existing
Cloudflare zone. It uses Cloudflare's request country code, not the browser
language, and does not add any client-side analytics or location requests.

For `CN` HTML responses, it keeps site links, the existing contact email, and
explicitly approved Bilibili hosts. It removes other external entries, the
GitHub/Utterances guestbook, and external gallery originals. The local gallery,
five language editions, and theme controls still use the existing site assets.
Other regions and requests without a known country receive the upstream page.

Before attaching the production route, test CN and non-CN egress against the
same route. Check the language picker, theme, and gallery in both variants.
Ensure no Cloudflare cache rule overrides the CN response's `private, no-store`
policy, and inspect for any third-party resources inserted at the edge. The
allowlist governs links and embeds in the current site, not any links a
Bilibili page may itself show after a visitor leaves the site.

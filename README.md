# Takallum Kids تَكَلُّم

A free Arabic speaking app for children aged about 4 to 11, and the children's version of [Takallum](https://takallum.ummahapps.ai/). Live at https://takallum-kids.ummahapps.ai/

**Content:** 21 units, 150 words and 152 sentences of two to four words, all in fully vowelled Modern Standard Arabic. Units 8 to 15 add 50 of the words children use most from Kalimat: use Kalimat to practise words and Takallum Kids to make sentences. Units 16 to 21 are for home and family, adapted for young children from Takallum's At home with children group: commands use the child's own form (boy or girl), and the "several children" forms are left out.

## How it works
- **Meet the words:** picture, vowelled Arabic, English and audio for each word in the unit.
- **Say the words:** see the picture, say the Arabic out loud, tap Show me, then I said it! or Try again. Try-again items come back later in the round.
- **Say the sentences:** each sentence lists the words it uses in `w`, and a check on load warns in the console if a sentence uses a word from a later unit.
- **Build the sentences:** the child taps the words of each sentence in order; one extra word from the unit is mixed in, and a wrong tap wiggles. A sentence built with no wrong taps gets `u`, which counts towards the second star.
- **Echo mode:** chosen per child ("I listen" when adding or changing a child) for children who can't read Arabic yet. In Say the words and Say the sentences the Arabic is shown and spoken straight away, and the child says it back.
- **Warm-up:** up to 8 items that are due (5 words and 3 sentences when it can), fewest checks passed first. A word plays and the child picks the picture out of 4; a sentence is built, or picked by picture in Echo mode. Only the first try counts. A miss takes `n` down one, comes back once in the round for practice, and is due again tomorrow.
- **Solid:** `n` counts checks passed, and only the warm-up raises it. An item is due 1 day after it is learned, then after 3, 7, 14 and 30 days (`GAP`). It is solid at `n` of 3 or more (`SOLID`), and rusty once it is more than 7 days overdue (`RUSTY_AFTER`). One warm-up pass makes it solid again. Older items with no `due` come up straight away.
- **Three stars on each unit:** all the words learned; all the sentences built (said, in Echo mode); everything solid. The unit's bar fills with the same progress.
- **Practise again:** up to 8 known items, lowest level and least recently seen first. Free practice that doesn't raise `n`.
- A word taught in another form than Kalimat lists it (جَدِّي for جَدّ, أَذْهَبُ for ذَهَبَ) has `k`, the Kalimat form, so it counts as known there.
- `SAY` in `index.html` changes how a word is sent to the voice when a voice misreads it, without changing what is shown.
- Nothing is locked: every unit and step is open from the start.
- Children: several profiles per device (`takallum-kids-profiles` in localStorage: name, boy/girl, animal), each with its own progress under `takallum-kids-progress-<id>`. Progress saved before profiles existed moves into a first profile called Learner 1.
- Boy or girl, chosen per child: words and sentences can carry an `f` override (and `ftip`) for a girl; praise and instructions switch too. `her` holds the form used with “her” words (colours, big, small).
- Progress: each item has a level from 0 to 5 and a learned flag. I said it! on the first try adds a level; Try again takes one off but never un-learns. Levels only order Practise again; stars come from `n`.

## Shared with the other apps
Takallum Kids, Kalimat, Kalimat Plus and Takallum share two things on the same device through `ummah.js`, which is copied into each app's folder (keep the four copies identical):
- **Learners:** name, boy or girl (man or woman), and animal, in the `ua_l` cookie on `.ummahapps.ai`. A learner added in one app appears in the others; a learner still called "Learner 1" stays in its own app until renamed.
- **Known words:** words learned in Takallum Kids and Known well words in Kalimat and Kalimat Plus go into a per-learner `ua_w_<id>` cookie as short hashes of the bare Arabic. Kalimat and Kalimat Plus offer to add words known from the other apps.

Each page also ends with the same four-app family strip. On localhost, `ummah.js` points the strip's links at the local servers (Kids 8771, Kalimat 8766, Kalimat Plus 8772, Takallum 8770).

## SEO and GEO
`index.html` has meta tags, Open Graph and JSON-LD (WebApplication + LearningResource + FAQPage), plus a visible About and FAQ section for grown-ups. `robots.txt`, `sitemap.xml` and `llms.txt` sit at the root.

## Running locally
```
node serve.js
```
Then open http://localhost:8765

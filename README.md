# Takallum Kids تَكَلُّم

A free Arabic speaking app for children aged about 4 to 11, and the children's version of [Takallum](https://takallum.ummahapps.ai/). Live at https://takallum-kids.ummahapps.ai/

**Content:** 15 units, 97 words and 104 sentences of two to four words, all in fully vowelled Modern Standard Arabic. Units 8 to 15 add 50 of the words children use most from Kalimat: use Kalimat to practise words and Takallum Kids to make sentences.

## How it works
- **Meet the words:** picture, vowelled Arabic, English and audio for each word in the unit.
- **Say the words:** see the picture, say the Arabic out loud, tap Show me, then I said it! or Try again. Try-again items come back later in the round.
- **Say the sentences:** opens once all of the unit's words are learned. Each sentence lists the words it uses in `w`, and a check on load warns in the console if a sentence uses a word from a later unit.
- **Build the sentences:** opens with Say the sentences. The child taps the words of each sentence in order; one extra word from the unit is mixed in, and a wrong tap wiggles. It doesn't change levels.
- **Echo mode:** chosen per child ("I listen" when adding or changing a child) for children who can't read Arabic yet. In Say the words and Say the sentences the Arabic is shown and spoken straight away, and the child says it back.
- **Practise again:** up to 8 known items, lowest level and least recently seen first.
- A word taught in another form than Kalimat lists it (جَدِّي for جَدّ, أَذْهَبُ for ذَهَبَ) has `k`, the Kalimat form, so it counts as known there.
- `SAY` in `index.html` changes how a word is sent to the voice when a voice misreads it, without changing what is shown.
- Units open one by one as the words in the previous unit are learned.
- Children: several profiles per device (`takallum-kids-profiles` in localStorage: name, boy/girl, animal), each with its own progress under `takallum-kids-progress-<id>`. Progress saved before profiles existed moves into a first profile called Learner 1.
- Boy or girl, chosen per child: words and sentences can carry an `f` override (and `ftip`) for a girl; praise and instructions switch too. `her` holds the form used with “her” words (colours, big, small).
- Progress: each item has a level from 0 to 5 and a learned flag. I said it! on the first try adds a level; Try again takes one off but never un-learns, so units don't lock again.

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

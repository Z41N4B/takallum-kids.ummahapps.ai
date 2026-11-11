# Takallum Kids تَكَلُّم

A free Arabic speaking app for children aged about 4 to 11, and the children's version of [Takallum](https://takallum.ummahapps.ai/). Live at https://takallum-kids.ummahapps.ai/

**Content:** 25 units, 208 words and 184 sentences, mostly two to four words, all in fully vowelled Modern Standard Arabic. Units 8 to 15 add 50 of the words children use most from Kalimat: use Kalimat to practise words and Takallum Kids to make sentences. Units 16 to 21 are for home and family, adapted for young children from Takallum's At home with children group: commands use the child's own form (boy or girl), and the "several children" forms are left out. Units 22 to 25 hold 32 short phrases from the ahadith, chosen from Takallum's From the ahadith group: each keeps the wording and the Sahih al-Bukhari or Sahih Muslim number and has no boy or girl form. One is the opening part of a longer hadith. Their word lists teach most of the words in the phrases, so each phrase lists them in `w`. No scholar has reviewed them.

**Garden, praise and Laith:** a pencil-sketch garden grows one plant for each day the warm-up is finished (`gardenDays`, `plantOf`), praise rotates through eight phrases in the child's form (`PRAISE`), and Laith the lion cub stars in 25 stories, one for each unit, built only from existing word and sentence ids (`STORIES`).

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
Takallum Kids, Kalimat, Kalimat Plus and Takallum share four things on the same device through `ummah.js`, which is copied into each app's folder (keep the four copies identical):
- **Learners:** name, boy or girl (man or woman), and animal, in the `ua_l` cookie on `.ummahapps.ai`. A learner added in one app appears in the others; a learner still called "Learner 1" stays in its own app until renamed. Removing a learner asks first, then removes them from all four apps: each app deletes their progress the next time it opens.
- **Known words:** words learned in Takallum Kids and Known well words in Kalimat and Kalimat Plus go into a per-learner `ua_w_<id>` cookie as short hashes of the bare Arabic. Kalimat and Kalimat Plus offer to add words known from the other apps.
- **Settings:** voice speed (slow, normal, natural), playing the Arabic straight away and vowel marks go with each learner in a `ua_s_<id>` cookie (`ua_s_d` for a learner with no name yet), and the voice help goes with the device in `ua_d`. The Settings panel that changes them is drawn by `ummah.js`, so it is the same in all four apps; each app opens it from its learner row or settings sheet and turns the speed into its own voice rate. The first time an app loads the shared settings, what was set in that app before fills in for the learners already on the device; new learners start from the defaults.
- **Today’s practice:** a card at the top of each app, drawn by `ummah.js`, with three steps like the Hifdh Helper’s day: revise old work (Known well checks in Kalimat, memory checks in Kalimat Plus, solid sentences that are due in Takallum, the warm-up in Takallum Kids), strengthen recent work (up to 10 Learning words or sentences not yet solid), and something new (3, 5 or 10 a day). Each app saves its own counts for the learner in a `ua_p_<id>` cookie (old work due today and each of the next 6 days, recent work, and today’s tallies) and the card adds up the apps chosen in Settings. Revising 20 counts as enough for one day. A day with any practice in any app counts towards the days in a row. The app chips on the card link to the other apps with `#ua-start=old|recent|new`, which starts that step there.

Each page starts with the four apps’ icons as quick links, top right in line with the page, with a gold ring on the app you are in, and ends with the same four-app family strip. On localhost, `ummah.js` points the strip's links at the local servers (Kids 8771, Kalimat 8766, Kalimat Plus 8772, Takallum 8770).

## SEO and GEO
`index.html` has meta tags, Open Graph and JSON-LD (WebApplication + LearningResource + FAQPage), plus a visible About and FAQ section for grown-ups. `robots.txt`, `sitemap.xml` and `llms.txt` sit at the root.

## Running locally
```
node serve.js
```
Then open http://localhost:8765

## Already learnt
A unit page has Mark it as already learnt for grown-ups. Every word and sentence in the unit counts as learnt and solid, so the unit gets its three stars; the warm-up still brings them back, spread over the next month. Each item keeps its record from before in `k`, so Undo puts it back.

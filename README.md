# Takallum Kids تَكَلُّم

A free Arabic speaking app for children aged about 4 to 11, and the children's version of [Takallum](https://takallum.ummahapps.ai/). Live at https://takallum-kids.ummahapps.ai/

**Content:** 7 units, 47 words and 42 sentences of two to four words, all in fully vowelled Modern Standard Arabic.

## How it works
- **Meet the words:** picture, vowelled Arabic, English and audio for each word in the unit.
- **Say the words:** see the picture, say the Arabic out loud, tap Show me, then I said it! or Try again. Try-again items come back later in the round.
- **Say the sentences:** opens once all of the unit's words are learned. Each sentence lists the words it uses in `w`, and a check on load warns in the console if a sentence uses a word from a later unit.
- **Practise again:** up to 8 known items, lowest level and least recently seen first.
- Units open one by one as the words in the previous unit are learned.
- Children: several profiles per device (`takallum-kids-profiles` in localStorage: name, boy/girl, animal), each with its own progress under `takallum-kids-progress-<id>`. Progress saved before profiles existed moves into a first profile called Learner 1.
- Boy or girl, chosen per child: words and sentences can carry an `f` override (and `ftip`) for a girl; praise and instructions switch too. `her` holds the form used with “her” words (colours, big, small).
- Progress: each item has a level from 0 to 5 and a learned flag. I said it! on the first try adds a level; Try again takes one off but never un-learns, so units don't lock again.

## SEO and GEO
`index.html` has meta tags, Open Graph and JSON-LD (WebApplication + LearningResource + FAQPage), plus a visible About and FAQ section for grown-ups. `robots.txt`, `sitemap.xml` and `llms.txt` sit at the root.

## Running locally
```
node serve.js
```
Then open http://localhost:8765

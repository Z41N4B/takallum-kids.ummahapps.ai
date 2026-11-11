# Takallum Kids

A free Arabic speaking app for children, live at https://takallum-kids.ummahapps.ai/

This file tells Claude (and anyone else working on the site) how the project works. It is part of the Ummah Apps family, listed at https://ummahapps.ai/.

## How this site works
- A plain static site: HTML, CSS and JavaScript with no build step and no server code. Most of the app is in `index.html`.
- It is hosted on GitHub Pages. Pushing to `main` puts it live within a minute or two. Keep the `CNAME` file, or the custom domain stops working.
- Nothing is uploaded. All progress is saved in the browser on the user's own device (localStorage, cookies or IndexedDB). There are no accounts, analytics or paid services.
- `README.md` describes every feature and the storage keys. Read it before changing anything, and update it in the same change when a feature changes.

## Saved progress is precious
Learners may have months of progress saved on their devices. Never rename or remove a storage key, cookie or data field without code that moves the old data across. Old saved data must still load. When a data shape changes, test with data saved by the old version.

## Writing style
- Use plain, simple English everywhere: on screen, in the README and in commit messages. Many users are children, parents, or people whose first language isn't English.
- Commit messages are one short sentence saying what changed for the user, for example "Go to the next question by itself 2 seconds after a right answer".
- Keep Arabic fully vowelled (harakat) unless the app has a setting to hide the vowels.

## Religious content
- Never make up or paraphrase Qur'an text, hadith wording or duas. Use only wording that is already in the app or that the owner provides, and keep the source (for example the Sahih al-Bukhari or Sahih Muslim number on sunnah.com).
- Follow the Prophet's name with "peace be upon him" (or ﷺ).
- If unsure whether something is religiously correct, ask the owner instead of guessing.

## Search engines and AI tools (SEO and GEO)
When a feature, count or description changes, also update what describes it: the meta description, the JSON-LD and the FAQ in `index.html`, `llms.txt`, and the date in `sitemap.xml`.

## Before saying a change is done
- Run the site locally and check the change in the browser preview, including on a phone-sized screen.
- Check the browser console for errors.
- Ask the owner before committing or pushing, because pushing makes it live for everyone.

## The four Arabic apps work together
Takallum Kids, Kalimat, Kalimat Plus and Takallum share learners, known words, settings and Today's practice through `ummah.js` (see "Shared with the other apps" in the README).
- **`ummah.js` must stay identical in all four repos.** After changing it here, copy the same file into the other three folders and commit it in all four. The folders sit next to each other: `../takallum-kids.ummahapps.ai`, `../kalimat.ummahapps.ai`, `../kalimat-plus.ummahapps.ai` and `../takallum.ummahapps.ai`.
- A change to the shared cookies (`ua_l`, `ua_w_<id>`, `ua_s_<id>`, `ua_p_<id>`, `ua_d`) affects all four apps. Check all four afterwards.
- The "Shared with the other apps" section is the same in all four READMEs. Keep it the same.
- To test them together locally, run each one on its own port, which `ummah.js` expects: Takallum Kids 8771, Kalimat 8766, Kalimat Plus 8772, Takallum 8770. For example, from this folder: `node serve.js 8766`.

## Takallum Kids
- The app is for children aged about 4 to 11. Keep the words and sentences short, and keep instructions easy for a child or a parent to read aloud.
- Every sentence lists the words it uses in `w`. A check on load warns in the console if a sentence uses a word from a later unit, so check the console after adding content.
- Stories with Laith may only use word and sentence ids that already exist.
- Girls' forms go in `f` (and `ftip`). Check both the boy and girl versions of anything new.
- The hadith phrases keep their exact wording and source number, and have no boy or girl form.

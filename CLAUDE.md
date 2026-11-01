# Rielle's Bubble Learn

An interactive learning app for a 6-year-old (Rielle): math, grammar, spelling, patterns, a memory-match game and a sticker book. Bubble theme, read-aloud questions, sounds and rewards.

## Structure
- Everything lives in `index.html`: HTML, CSS and JavaScript in one file. There is no build step and there are no dependencies, except the Google Font "Fredoka".
- Open `index.html` in a browser to run it, or serve the folder with something like `npx serve .`.
- Installable web app (PWA): `manifest.webmanifest` and the service worker `sw.js` sit next to `index.html`. The service worker only runs over http(s), so test installing and offline mode with `npx serve .`, not by opening the file. When you change the list of files in `sw.js`, bump its `CACHE` name.
- Hosting: Render static site, set up in `render.yaml`. Its build copies `index.html`, the manifest, `sw.js` and the web icons into `public/`. Add any new file the page needs to that build command.

## Code map (inside the `<script>`)
- `P`: saved progress (stars, per-subject levels, sound and voice toggles), stored in localStorage under `rielle-bubble-learn`.
- `sfx()` / `tone()`: sound effects, made with the Web Audio API (no audio files).
- `speak()`: reads text aloud with the browser's built-in speech synthesis.
- Question generators: `genMath`, `genWords` (uses the `G` object of grammar question types), `genSpell`, `genPattern`. Each one takes a level (1–3) and returns `{ text, say, visual?, choices[], answer, small?, emo? }`. `answer` must be one of `choices`, and choices must be unique strings.
- `GEN` maps each subject key to its generator.
- Screens: `home()`, `startQuiz()` / `renderQuiz()` / `choose()` / `finishQuiz()`, `memoryPick()` / `startMemory()`, `stickers()`, `settings()`, `showDone()`.
- All clicks go through one delegated `document` click handler that reads `data-*` attributes.

## Adding a subject
1. Add an entry to `SUBJ` (name, icon, colors).
2. Write a `genX(level)` function and register it in `GEN`.
3. Add its starting level to `P.levels` (in both the defaults and the reset handler).
4. Add a level row to `settings()`.

## App icon
- Icon source: `assets/icon.svg`. The web page uses it as its favicon, and `assets/icon-1024.png` as the Apple touch icon.
- Adaptive icon foreground: `assets/icon-foreground.svg`.
- Play Store icon: `assets/play-store-512.png`.
- Ready-made Android launcher icons are in `assets/android/res/`. Once `android/` exists, copy them into `android/app/src/main/res/` (replacing the default `mipmap-*` icons), then run `npx cap sync android`.

## Android plan
Chosen approach: **Capacitor** wraps the existing web app first. Flutter is a possible later rewrite.

### Phase 1: Capacitor (do this first)
1. Move `index.html` into a `www/` folder. Keep it a single self-contained file.
2. In the project root:
   - `npm init -y`
   - `npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor-community/text-to-speech`
   - `npx cap init "Rielle's Bubble Learn" com.visionaire.bubblelearn --web-dir www`
   - `npx cap add android`
3. **Read-aloud fix (required):** `speechSynthesis` is unreliable in Android WebView. Change `speak()` so that when running natively (`window.Capacitor?.isNativePlatform()`) it uses the `TextToSpeech` plugin (`TextToSpeech.speak({ text, lang: 'en-US', rate: 0.9, pitch: 1.15 })`, with `TextToSpeech.stop()` before each new phrase). In a normal browser it should keep using `speechSynthesis`. Because there is no bundler, import the plugin through `window.Capacitor.Plugins.TextToSpeech`.
4. Bundle the Fredoka font locally (`www/fonts/`) so the app looks right offline, and keep the system-font fallback.
5. Lock the app to portrait. Hide the status bar, or give it a matching color.
6. App icon and splash screen: use the Bubbo mascot on the purple-to-pink gradient (`@capacitor/assets` can generate them).
7. After each web change, run `npx cap sync android`. Then use `npx cap open android` and build or run from Android Studio.
8. Test on a real tablet: tap targets, sounds (Web Audio needs a first tap, which already happens), saved progress, and read-aloud.

### Phase 2: Flutter rewrite (optional, if publishing widely)
- Port the question generators to Dart as plain functions that return the same shape (`text`, `say`, `choices`, `answer`).
- Use `flutter_tts` for voice, `shared_preferences` for progress, and `audioplayers` or generated tones for sound effects.
- Rebuild the bubble UI with implicit animations. Match the colors and the mascot from the web version.

### Play Store (if published)
- Follow Google Play's **Families policy**: no ads or ad SDKs, no analytics that collect personal data, no outside links without a parent gate, and a simple privacy policy stating that no data is collected.
- Target audience: ages 5–8. Keep the app fully offline with no accounts.

## Guidelines
- The audience is a 6-year-old: big tap targets, short sentences, every question gets a spoken `say` string, and feedback stays encouraging.
- Keep it as a single self-contained file unless asked otherwise.

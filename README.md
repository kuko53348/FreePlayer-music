# musicUI

FletBox app with 3 screens: Root, Home (the design system) and About
(preferences), plus Drawer menu. Read `src/screens/HomeScreen.js` first: it is
the contract this app is built on, and `npm run ui` enforces it.
The generated Capacitor configuration uses package id `com.fletbox.musicui`.

## Quick Start

```bash
npm install
npm run dev
```

## Autocomplete without TypeScript

`jsconfig.json` points the editor's own JavaScript language service at
`flet-box`'s bundled `.d.ts` — nothing to install, nothing to compile. Every
widget, prop, colour token and helper autocompletes in VS Code (or any editor
that reads jsconfig), and a prop that does not exist is underlined as an error
instead of failing silently at runtime. `src/` is the only folder checked;
`npm run check` remains the gate that runs in CI.

## Working with an AI assistant

This project ships an in-project agent contract, so an AI editing the app uses the
real FletBox API instead of inventing one and burning tokens relearning the
framework from scratch:

- `AGENTS.md` — the rules: FletBox syntax only, real widgets and props only, and the
  verification loop it must run after every edit.
- `skills/` — four files, one per subject, mirrored into `.claude/skills/`,
  `.qoder/skills/` and `.cursor/rules/` so any assistant reads the same contract:
  `fletbox-rules` (FletBox only, look an API up before using it, the rem contract),
  `fletbox-design` (the numbered design rules — tokens, the scale, hierarchy, the
  four states, measured contrast, the dated tells), `fletbox-motion` (when a screen
  may move and through which widget) and `fletbox-memory` (the journal that hands
  progress from one AI to the next). `AGENTS.md` §0 is the index.
- `.claude/CLAUDE.md`, `.cursor/rules/fletbox.mdc` — short pointers to `AGENTS.md` for
  Claude Code and Cursor.
- `.fletbox/api/cheatsheet.md` — every widget and its real props, generated from the
  installed package. This is the lookup an agent reads instead of the framework.
  A prop marked `(deprecated → x)` still works, but it is the name being retired;
  write `x`. The old spelling will not fail — nothing else will tell you.
- `.fletbox/api/api.json` — the same surface as data: per prop its engine target,
  default, aliases and a `sample` value the types prove works. Write calls from this.
- `.fletbox/memory/` — notes the agent keeps between sessions, so it does not
  rediscover the same thing twice.
- `scripts/check-app.mjs` — the gate that catches hallucinated APIs.
- `scripts/check-ui.mjs` — the gate that catches an unclean screen.

```bash
npm run check                      # scan src/ for invented widgets, props, imports
npm run check -- --props Button    # print the real props of one widget
npm run check -- --list            # print every public export
npm run ui                         # clean-UI gate: tokens, scale, tap targets, labels,
                                   # contrast — each finding cites the rule it broke
npm run ui -- --tokens             # measured contrast of every token, on both surfaces
npm run ui -- --strict             # warnings (a one-off tint, an image with no alt) fail too
npm run fix                        # rewrite what it can prove: imports, prop typos,
                                   # renamed props
npm run api                        # regenerate .fletbox/api/api.json and api.md
flet-box unpack Button             # each prop, where it really goes, and what is dead
flet-box unpack Button --example   # a paste-ready call using only verified props
flet-box unpack Modal --diff       # where types, engine, docs and code disagree
```

`npm run check` and `npm run ui` exit non-zero on a real error and also run in CI. If
you upgrade `flet-box`, regenerate the cheatsheet with `flet-box check-api --emit-api`
and the machine-readable surface with `npm run api`.

## Android

This project is preconfigured for Capacitor. Install Node.js 20.9 or newer,
Android Studio, and the Android SDK. Then create the native Android project:

```bash
npm install
flet-box build android
```

The command initializes Android on first use, builds and synchronizes the web
app, generates launcher icons from `assets/logo.png`, and compiles a debug APK
at `android/app/build/outputs/apk/debug/app-debug.apk`. It installs missing
project npm dependencies and prints the absolute APK path when finished.
Android Studio, Java, and the Android SDK must already be installed. Replace
that image with your app logo before distributing. To open the native project
in Android Studio, run `npm run android:open`. For a signed release, use
**Build → Generate Signed Bundle / APK** in Android Studio. The PWA manifest
icons are in `src/assets/`.

## iOS

This project is preconfigured for Capacitor iOS. On macOS, install the full
Xcode app, its iOS simulator runtime, and CocoaPods
(`sudo gem install cocoapods` then `pod setup`). Node.js 20.9 or newer is
required. Then build the simulator app:

```bash
npm install
flet-box build ios
```

The command initializes iOS on first use, builds and synchronizes the web app,
generates the app icon, launch images and launch screen background from
`assets/logo.png`, and compiles
`ios/build/Build/Products/Debug-iphonesimulator/App.app`. It prints the
absolute path when finished. Install it on a running simulator with
`xcrun simctl install booted <path>`.

For a real device or the App Store, build the unsigned archive and sign it with
your Apple team:

```bash
flet-box build ios --archive
```

That writes `ios/build/App.xcarchive`. Open it in Xcode (Product → Archive) with
a signing team selected to export an IPA. To open the native project directly,
run `npm run ios:open`.

Replace `assets/logo.png` with a 1024×1024 logo before distributing; the icon,
the launch images and the launch background are all generated from it. The
launch background is the app brand color `#18181b`, which lives in
`scripts/sync-ios-assets.mjs`.

Capacitor uses a local HTTPS origin (`https://localhost`) in the Android and
iOS WebViews. If the app calls a remote API, allow that origin in the API's
CORS configuration and use HTTPS for the remote service.

## Continuous Integration (GitHub Actions)

Two workflow files ship with the project, and they answer to different triggers:

- `.github/workflows/build.yml` — **the web, automatic**. Every push to `main`
  (and a manual run) builds `www/` and publishes it to **GitHub Pages**, in two
  jobs: **Build site** checks the app, bundles it and uploads the result; **Deploy
  to Pages** is the only job that can replace the live site, so a bundle that
  fails to build leaves the current one running. A `v*` tag is deliberately not
  a trigger: the Pages environment refuses a run that starts from a tag, so the
  release is deployed by running this workflow again after tagging.
- `.github/workflows/build-native.yml` — **Android and iOS, manual only**. Nothing
  runs on a push. Open **Actions → "… — native (manual)" → Run workflow** and pick
  `android`, `ios` or `both`. Each job uploads its build as a run artifact and
  prints the artifact name and the run URL in its own log.

### Publish the web (one-time setup)

1. Push this project to a GitHub repository.
2. Open **Settings → Pages** in that repo.
3. Set **Source** to **GitHub Actions** (not "Deploy from a branch"). Skip this
   and the deploy step fails on every push.
4. Push. The **Where this lives** step prints the address before the deploy runs,
   and the **Published** step prints it again as a run annotation, so you do not
   have to hunt for the environment box under the job.

The address this project publishes to is written at the top of
`.github/workflows/build.yml`. `flet-box create <name> --repo <user>/<repo>`
fills it in from the repo; without `--repo` it stays
`https://TU-USUARIO.github.io/<name>/`, and the header explains what is still a
guess. The build ignores that placeholder in `fletbox.config.json` and derives
the real address from this repository, so the OTA feed is correct either way.

The Pages address is a sub-path, so `index.html` uses relative asset paths and
works without changes.

**Why a push does not update anyone's app:** this same address is the OTA feed
installed apps poll, and the update check compares bundle **hashes**, not version
numbers. So the workflow leaves `www/config.json` out of every artifact that is
not a `v*` tag: the site is live for reading, while a device keeps running the
last `flet-box release` until a tag publishes a manifest. The **Where this
lives** step prints which of the two a given run was. Cut a release with
`flet-box release --patch --push` when the app is worth updating.

### Download the mobile artifacts

Start it by hand — **Actions → "… — native (manual)" → Run workflow**, pick a
platform — and open that run: the Android APK and the iOS `.app` are listed
under **Artifacts** at the bottom of the run summary, and the job's own log prints
the artifact name plus the URL of the run it belongs to.

> The workflow installs dependencies with `npm install`, which resolves the
> `flet-box` package from npm. If you develop against a local copy of the
> framework, publish it first — or add a step that checks out the framework and
> runs `npm pkg set dependencies.flet-box=file:<path>` before `npm install`.

## Ads (AdSense & AdMob) — optional

Both ad integrations ship **disabled by default**, ready to switch on. Replace
every `ca-pub-XXXXXXXXXXXXXXXX` / `ca-app-pub-XXXXXXXXXXXXXXXX` placeholder
with your own IDs from the AdSense/AdMob console. While developing keep test
mode on and never click your own live ads — AdMob can ban the account.

### AdSense (web)

`index.html` has a commented-out AdSense `<script>` in the `<head>`. To
enable: get an approved domain at https://www.google.com/adsense, put your
publisher ID in the script, and delete the surrounding `<!--` / `-->` so the
tag goes live. Ads only render on an approved domain, not on localhost. You can
also drop the `AdSense` widget into any screen (see
https://github.com/kuko53348/flet-box/blob/refactory/docs/widget/AdSense.md).

### AdMob (Android / iOS)

1. Install the Capacitor plugin:

   ```bash
   npm install @capacitor-community/admob
   ```

2. Add your AdMob **App ID** to the native projects.

   Android — `android/app/src/main/AndroidManifest.xml`, inside `<application>`:

   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
   ```

   iOS — `ios/App/App/Info.plist`, inside the top-level `<dict>`:

   ```xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
   ```

3. Sync and rebuild:

   ```bash
   npm run android:sync && npm run ios:sync
   ```

4. Uncomment the `AdMob` import and the `AdMob({...})` widget in
   `src/screens/HomeScreen.js` (they are marked with ADMOB comments). Full
   props in
   https://github.com/kuko53348/flet-box/blob/refactory/docs/widget/AdMob.md.

## Over-the-air updates (OTA)

This app can update its web layer without a new store submission. The project
ships with `fletbox.config.json`, which tells the app where to check for
updates:

```json
{
  "update": {
    "url": "https://TU-USUARIO.github.io/TU-REPO/",
    "mode": "prompt"
  }
}
```

- The GitHub repository **must be public**.
- `TU-USUARIO`/`TU-REPO` are a placeholder, not a setting: the build sees them as
  "not configured" and derives the Pages address from this project's `repository`
  field or git remote, so pushing the folder is enough. Edit `update.url` only
  when the app lives on another HTTPS host that serves your `config.json` + bundle.
- Enable GitHub Pages: **Settings → Pages → Source: GitHub Actions**. Without
  that the deploy step is green and no site exists.
- Cut a release with `flet-box release --push` (bumps the version, rebuilds
  `www/`, commits and tags `vX.Y.Z`). CI then deploys `www/` and installed
  apps self-update the next time they open.
- A plain `git push` also deploys `www/` — that is the preview, and the job
  prints the address. It never publishes `www/config.json`, because that file
  is the update feed and the app compares bundle **hashes**: without it an
  installed app finds no manifest and stays on the last release. Do not "fix"
  that gate; the release tag is the only thing that should reach users.
- Android and iOS are not built on a push. Start
  `.github/workflows/build-native.yml` from **Actions → Run workflow** and pick
  `android`, `ios` or `both`.
- The update URL is also reflected in `www/config.json` after `flet-box
  createBundle www`; it is baked into Android/iOS builds at `cap sync` time.
- Only web files are updated OTA. Native changes (plugins, permissions,
  manifest/Info.plist edits) still require a new store submission.

## Features

- Root screen: one filled action, one quiet one
- Home screen: the spacing rhythm, the type scale and the three color roles,
  drawn from the framework's own scale
- About screen: `useState`, an `Input`, a `Dropdown`, a labelled `Switch`,
  a `Slider` that moves the base font size, a `SnackBar` reply and an
  `AlertDialog` before the destructive action
- Neutral app bar with a theme toggle that carries a `Tooltip` name
- Drawer menu for navigation
- PWA icons and Capacitor Android launcher/splash assets
- Capacitor iOS project, icon and launch screen assets
- Dark/Light theme support

## Project Structure

```
├── src/
│   ├── app.js
│   ├── components/
│   │   └── layouts/
│   │       └── DrawerMenu.js
│   ├── screens/
│   │   ├── RootScreen.js
│   │   ├── HomeScreen.js
│   │   └── AboutScreen.js
│   └── database/
│       └── themes.js
├── index.html
├── package.json
└── run.sh
```

## License

MIT

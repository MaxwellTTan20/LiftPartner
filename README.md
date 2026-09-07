# LiftPartner

A mobile-first PWA lifting tracker. The centerpiece is a 3D body model built
from primitive geometry (no external 3D assets) where every muscle is
colored on a gray -> red scale (0-100) based on how much volume you've put
into it. Log a workout and only that session's muscles light up; the Home
tab shows a rolling monthly view with feedback tailored to your goal.

Stack: Vite + React 19 + TypeScript, Tailwind v4, react-three-fiber / three.js
for the 3D model, Firebase (Auth, Firestore, Storage), react-router, and
vite-plugin-pwa for installability.

## 1. Firebase console checklist

The Firebase project (`liftpartner-776e5`) and Firestore database are
already set up. Two things still need to happen in the
[Firebase console](https://console.firebase.google.com/project/liftpartner-776e5)
before sign-in and selfies will work:

1. **Enable Google sign-in** - Authentication -> Sign-in method -> add
   "Google" as a provider (pick a support email) -> Save.
2. **Enable Storage** - Storage -> Get started (if you haven't already) to
   create the default bucket used for selfie photos.

Then publish the security rules already included in this project
(`firestore.rules` and `storage.rules`) - either paste them into the
console's Rules tab for Firestore and Storage, or, if you have the
[Firebase CLI](https://firebase.google.com/docs/cli) installed:

```bash
firebase login
firebase deploy --only firestore:rules,storage
```

Both rule files scope reads/writes to the signed-in user's own data.

### CORS on the Storage bucket (needed for the selfie to show on the 3D model)

The Account page shows your selfie fine with a plain `<img>` tag - but the 3D
model has to load that same photo as a WebGL texture, and browsers block
WebGL from reading cross-origin images unless the server sends CORS headers.
Firebase Storage doesn't send them by default, so without this step the photo
saves fine but silently fails to appear on the model (the app is written to
fail quietly here rather than crash the whole 3D view).

A `cors.json` file is already in this project. Apply it to the bucket with
the [gcloud CLI](https://cloud.google.com/sdk/docs/install) (or open
[Cloud Shell](https://console.cloud.google.com) in the browser, which has
gcloud preinstalled and needs no local setup):

```bash
gcloud config set project liftpartner-776e5
gcloud storage buckets update gs://liftpartner-776e5.firebasestorage.app --cors-file=cors.json
```

Refresh the app after that - no code change needed, the model reloads the
texture on next load.

## 2. Run it locally

Dependencies are already installed. From this folder:

```bash
npm run dev
```

Open the printed `http://localhost:5173` URL. For a real mobile test, open
it on your phone's browser while on the same Wi-Fi as your computer using
`npm run dev -- --host` (prints a `http://<your-ip>:5173` URL) - camera
access (for the selfie step) needs either `localhost` or HTTPS, so this is
the easiest way to test on-device without deploying.

`npm run build` produces a production bundle in `dist/` (already verified
to build cleanly). `npm run preview` serves that build locally.

## 3. Deploying (when you're ready)

Not done yet, by request - the app currently only runs locally. When you
want it live:

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
npm run build
firebase deploy --only hosting
```

`firebase.json` and `.firebaserc` are already configured for the
`liftpartner-776e5` project and the `dist/` output folder.

## Project structure

- `src/data/muscles.ts` - the 29 muscle definitions (position/shape/orientation)
  that drive the 3D model. Same geometry system as the standalone prototype:
  `ellipsoid` = tapered limb muscles, `dome` = rounded bulges (chest, delts,
  glutes) that sit flush on the skeleton.
- `src/data/exercises.ts` - the exercise -> muscle weighting table. Add new
  lifts here; each maps to a `Record<muscleId, 0..1>` of relative emphasis.
- `src/lib/scoring.ts` - turns logged sets into 0-100 muscle scores (see
  `MONTHLY_TARGET_VOLUME` / `WORKOUT_TARGET_VOLUME` to retune sensitivity)
  and the goal-based feedback copy (V-taper tips for aesthetics, big-3
  balance for strength, region coverage for general fitness).
- `src/lib/progress.ts` - per-lift progress over time, used on the workout
  detail page.
- `src/components/BodyModel.tsx` - the react-three-fiber component: thin
  skeleton + score-colored muscles + the selfie taped onto the head.
- `src/pages/` - Onboarding, Home (monthly dashboard), LogWorkout,
  PastWorkouts, WorkoutDetail, Account.
- `src/contexts/AuthContext.tsx` - Google sign-in + the Firestore user
  profile (goal, frequency, selfie URL, onboarding state).

## Known limitations / next steps

- The production JS bundle is ~500KB gzipped (three.js + firebase + React
  are all inherently sizeable); pages are already lazy-loaded per route, but
  if load time on real devices matters, look at trimming unused Firebase
  SDK pieces or swapping `@react-three/drei`'s `OrbitControls` for a smaller
  hand-rolled version.
- Monthly view is computed client-side from all logged workouts filtered to
  the current calendar month - nothing is destructively deleted, so History
  always has the full log.
- The exercise table (`src/data/exercises.ts`) covers ~50 common lifts,
  weighted by best estimate, not lab data - tune freely.

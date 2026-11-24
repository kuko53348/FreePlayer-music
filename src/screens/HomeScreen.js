// screens/HomeScreen.js
// The screen that shows what the app is built on. Every number on this page is a
// member of the framework's own scale, so the page documents the system it uses:
// change one to an off-scale value and 'npm run ui' reports it.
import { Container, Column, Row, Text, Icon, Chip, colors } from 'flet-box';

// ========== GOOGLE ADMOB (optional — disabled by default) ==========
// AdMob shows native ads in Android/iOS builds. To enable it:
//   1. Install the Capacitor plugin:
//        npm install @capacitor-community/admob
//   2. Add your real AdMob App ID to the native projects (see the README
//      "Ads (AdSense & AdMob)" section for the Android/iOS manifest keys),
//      then run: npm run android:sync && npm run ios:sync
//   3. Uncomment the AdMob import and the <AdMob .../> widget below.
// While developing, keep isTesting: true so you serve Google's sample ads
// (never click your own live ads — AdMob can ban the account).
//
// import { AdMob } from 'flet-box';
// =====================================================================

const SPACING_STEPS = [4, 8, 12, 16, 24, 32, 48, 64];

const TYPE_STEPS = [
    { size: 12, label: 'Caption' },
    { size: 14, label: 'Body' },
    { size: 18, label: 'Title' },
    { size: 24, label: 'Headline' },
    { size: 32, label: 'Display' }
];

// Three roles, and each one says when it is allowed on the page. A fourth would
// be decoration looking for a reason.
const COLOR_ROLES = [
    { token: 'primary', text: 'Brand', note: 'the one action this screen asks for' },
    { token: 'successStrong', text: 'Feedback', note: 'status, never ornament' },
    { token: 'dangerStrong', text: 'Danger', note: 'the red that carries words' }
];

export const HomeScreen = () => {
    return Container({
        flex: 1,
        padding: 24,
        overflow: 'auto',
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            // A reading column, not a full-width one: at 1400px a line of body
            // text becomes unreadable, so the measure is capped and centred.
            maxWidth: 640,
            margin: '0 auto',
            children: [
                Column({
                    gap: 8,
                    children: [
                        Text({ text: 'The system this app is built on', size: 32, weight: 'bold', color: colors.text }),
                        Text({
                            text: 'Three roles, one rhythm, one type scale. Nothing here is typed by hand.',
                            size: 16,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    children: [
                        Text({ text: 'Spacing', size: 18, weight: 'bold', color: colors.text }),
                        Row({
                            gap: 12,
                            alignItems: 'end',
                            // Eight squares plus their labels need ~300 units. Without
                            // wrapping they overflow a narrow column — a sidebar on a
                            // small window, or this same screen beside a desktop nav.
                            wrap: true,
                            children: SPACING_STEPS.map((step) =>
                                Column({
                                    // Column is a 100%-wide block by default — the
                                    // right answer for a page, the wrong one for eight
                                    // cells in a row, where it makes them share the
                                    // width out and the squares drift apart.
                                    width: 'auto',
                                    gap: 8,
                                    alignItems: 'center',
                                    children: [
                                        Container({
                                            width: step,
                                            height: step,
                                            borderRadius: 4,
                                            backgroundColor: colors.primaryBg,
                                            border: '1px solid ' + colors.border
                                        }),
                                        Text({ text: String(step), size: 12, color: colors.textSecondary })
                                    ]
                                })
                            )
                        }),
                        Text({
                            text: 'These are framework units, not pixels: raise the browser font size and every square, gap and corner grows with the text.',
                            size: 14,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    children: [
                        Text({ text: 'Type', size: 18, weight: 'bold', color: colors.text }),
                        Column({
                            gap: 8,
                            children: TYPE_STEPS.map((step) =>
                                Row({
                                    gap: 12,
                                    alignItems: 'center',
                                    children: [
                                        Text({ text: step.label, size: step.size, weight: 'bold', color: colors.text }),
                                        Text({ text: String(step.size), size: 12, color: colors.textSecondary })
                                    ]
                                })
                            )
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    children: [
                        Text({ text: 'Color roles', size: 18, weight: 'bold', color: colors.text }),
                        Column({
                            gap: 8,
                            children: COLOR_ROLES.map((role) =>
                                Row({
                                    gap: 12,
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: 12,
                                    backgroundColor: colors.surface,
                                    children: [
                                        Icon({ name: 'palette', size: 24, color: colors[role.token] }),
                                        Column({
                                            gap: 4,
                                            flex: 1,
                                            children: [
                                                Text({ text: role.text, size: 16, weight: 'bold', color: colors.text }),
                                                Text({ text: role.note, size: 14, color: colors.textSecondary })
                                            ]
                                        }),
                                        // The token name is the lesson; a Chip is how a
                                        // framework value gets shown without becoming a
                                        // colour of its own.
                                        Chip({ label: role.token, variant: 'outlined', color: colors.textSecondary, size: 12 })
                                    ]
                                })
                            )
                        })
                    ]
                })

                // ===== ADMOB BANNER (optional — uncomment to enable) =====
                // Uses Google's sample unit id while isTesting is true.
                // Replace adId with your own banner unit id before going live.
                // AdMob({
                //     position: 'bottom',
                //     isTesting: true,
                //     // adId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
                // })
            ]
        })
    });
};

export default HomeScreen;

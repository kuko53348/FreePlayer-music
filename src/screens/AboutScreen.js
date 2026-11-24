// screens/AboutScreen.js
// Preferences, written the way the rest of the app should be written: state that
// survives a re-render, a control that names itself, validation that speaks
// instead of disabling, and one filled button per screen.
import {
    Container,
    Column,
    Row,
    Text,
    Button,
    Input,
    Dropdown,
    Switch,
    Slider,
    Divider,
    Tooltip,
    ThemePicker,
    Icon,
    SnackBar,
    AlertDialog,
    Storage,
    colors,
    useState,
    setTheme,
    getTheme,
    setBaseFontSize,
    getBaseFontSize,
    listAccents
} from 'flet-box';

// Key-based RAM keeps a value across re-renders and hot reloads; localStorage is
// what keeps a choice across sessions. A preferences screen that writes neither
// is a form that lies, so the size is read back at boot — before the first
// render, and before the draft below seeds itself from the live value.
const storedSize = Storage.getData('baseFontSize');
if (storedSize) setBaseFontSize(storedSize);

const [draftSize, setDraftSize] = useState('prefFontSize', getBaseFontSize());

// The destructive action is built once, at module scope. The dialog puts Cancel
// first on its own: the way out is the first thing the eye lands on.
const resetDialog = AlertDialog({
    title: 'Reset the text size?',
    message: 'It goes back to 16, the size this browser asks for.',
    variant: 'danger',
    confirmText: 'Reset',
    cancelText: 'Keep it',
    onConfirm: () => {
        setDraftSize(16);
        setBaseFontSize(16);
        // Resetting is the absence of a preference, not a new one: the key goes
        // away, so the next boot answers to the browser again.
        Storage.deleteData('baseFontSize');
        SnackBar({ message: 'Text size reset', type: 'success' }).show();
    }
});

// Validation runs before the action, so the error is a message and never a
// disabled button the user has to discover.
const save = (name, region) => {
    if (name.length === 0) {
        return SnackBar({ message: 'Give the profile a name first', type: 'error' }).show();
    }
    const size = draftSize.valueOf();
    setBaseFontSize(size);
    Storage.saveData('baseFontSize', size);
    Storage.saveData('displayName', name);
    Storage.saveData('region', region.valueOf());
    SnackBar({ message: 'Preferences saved', type: 'success' }).show();
};

export const AboutScreen = () => {
    const [name, setName] = useState('prefName', Storage.getData('displayName') || '');
    const [region, setRegion] = useState('prefRegion', Storage.getData('region') || '');
    const isDark = getTheme() === 'dark';
    const size = draftSize.valueOf();

    return Container({
        flex: 1,
        padding: 24,
        overflow: 'auto',
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            maxWidth: 480,
            margin: '0 auto',
            children: [
                Column({
                    gap: 8,
                    children: [
                        Text({ text: 'Preferences', size: 32, weight: 'bold', color: colors.text }),
                        Text({
                            text: 'Every control writes a real framework value: the slider moves the base font, the whole app rescales, and Save remembers it for the next visit.',
                            size: 16,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Input({
                    label: 'Display name',
                    placeholder: 'How the app should greet you',
                    value: name.valueOf(),
                    required: true,
                    onChange: (value) => setName(value)
                }),
                Dropdown({
                    label: 'Region',
                    options: [
                        { value: 'cl', label: 'Chile' },
                        { value: 'es', label: 'Spain' },
                        { value: 'mx', label: 'Mexico' }
                    ],
                    placeholder: 'Where you are',
                    value: region.valueOf(),
                    onChange: (value) => setRegion(value)
                }),
                Divider(),
                // A toggle that never says what it switches is a mystery control: the
                // label is part of the Switch, and the row is the tap target.
                Switch({
                    label: 'Dark theme',
                    value: isDark,
                    activeColor: colors.primary,
                    onPress: (value) => setTheme(value ? 'dark' : 'light')
                }),
                // The accent is the reader's answer, not the build's. This app opens on
                // neutral (themes.js applies it at boot) and this row is how they leave it:
                // one square per family, split diagonally into what the hue wears on a light
                // page and what it wears on a dark one, with the tick already on the family
                // painted. A tap repaints every widget on screen and stores the choice, so
                // this does not wait for the Save button below — that keeps the profile.
                // Five squares is a decision; `listAccents()` has twelve, so the filter is
                // the brand's answer to what this app is willing to look like.
                Column({
                    gap: 8,
                    children: [
                        Text({ text: 'Accent color', size: 16, weight: 'bold', color: colors.text }),
                        ThemePicker({
                            label: 'Accent color',
                            accents: listAccents().filter((family) =>
                                ['neutral', 'blue', 'teal', 'rose', 'orange'].includes(family.id)
                            ),
                            onChange: (id) =>
                                SnackBar({ message: 'Accent: ' + id, type: 'success' }).show()
                        })
                    ]
                }),
                Column({
                    gap: 8,
                    children: [
                        Row({
                            gap: 12,
                            alignItems: 'center',
                            children: [
                                Text({ text: 'Text size', size: 16, weight: 'bold', color: colors.text }),
                                Text({ text: size + 'px', size: 14, color: colors.textSecondary })
                            ]
                        }),
                        Slider({
                            min: 14,
                            max: 22,
                            step: 1,
                            value: size,
                            color: colors.primary,
                            onPress: (value) => setDraftSize(value)
                        }),
                        Text({
                            text: '16 is what the browser asks for. Anything larger is the reader asking to be readable.',
                            size: 14,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Divider(),
                Column({
                    gap: 12,
                    children: [
                        // One filled button per screen: it is the thing this screen asks
                        // for, and it is the only control on the page that stretches —
                        // a full-width target is a decision, not a layout default.
                        Button({
                            text: 'Save preferences',
                            iconLeft: 'check',
                            bgColor: colors.primary,
                            color: colors.onPrimary,
                            fullWidth: true,
                            onPress: () => save(name.valueOf(), region.valueOf())
                        }),
                        Row({
                            gap: 12,
                            alignItems: 'center',
                            children: [
                                // A second, quieter action: text variant, danger token,
                                // and it asks before it destroys.
                                Button({
                                    text: 'Reset the size',
                                    iconLeft: 'restart_alt',
                                    variant: 'text',
                                    color: colors.dangerStrong,
                                    onPress: () => resetDialog.open()
                                }),
                                // An icon alone says nothing; the Tooltip is its name.
                                Tooltip({
                                    text: 'Resetting the size is not undoable from this screen',
                                    position: 'right',
                                    child: Icon({ name: 'help_outline', size: 24, color: colors.textSecondary })
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
};

export default AboutScreen;

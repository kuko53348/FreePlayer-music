// screens/ProfileScreen.js
import { Container, Column, Row, Text, Icon, Divider, colors, Storage, goTo } from 'flet-box';

// Two words, from whatever the reader typed on the Preferences screen.
const initials = (name) =>
    name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

const linkRow = (icon, label, note, route) => Container({
    padding: 16,
    cursor: 'pointer',
    child: Row({
        gap: 12,
        alignItems: 'center',
        children: [
            Icon({ name: icon, size: 20, color: colors.textSecondary }),
            Column({
                flex: 1,
                gap: 4,
                alignItems: 'stretch',
                children: [
                    Text({ text: label, size: 16, color: colors.text }),
                    Text({ text: note, size: 12, color: colors.textSecondary })
                ]
            }),
            Icon({ name: 'chevron_right', size: 20, color: colors.textSecondary })
        ]
    }),
    onclick: () => goTo(route)
});

export const ProfileScreen = () => {
    const name = Storage.getData('displayName') || '';

    return Container({
        flex: 1,
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            alignItems: 'stretch',
            maxWidth: 480,
            margin: '0 auto',
            children: [
                Row({
                    gap: 16,
                    alignItems: 'center',
                    children: [
                        Container({
                            width: 64,
                            height: 64,
                            borderRadius: 999,
                            backgroundColor: colors.primaryBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            child: Text({
                                text: initials(name) || 'P',
                                size: 24,
                                weight: 'bold',
                                color: colors.primary
                            })
                        }),
                        Column({
                            flex: 1,
                            gap: 4,
                            alignItems: 'stretch',
                            children: [
                                Text({ text: name || 'No name yet', size: 18, weight: 'bold', color: colors.text }),
                                Text({
                                    text: name ? 'Saved on this device' : 'Add one under Preferences',
                                    size: 14,
                                    color: colors.textSecondary
                                })
                            ]
                        })
                    ]
                }),
                Divider(),
                Column({
                    gap: 4,
                    alignItems: 'stretch',
                    children: [
                        linkRow('tune', 'Preferences', 'name, region, theme and text size', '/about'),
                        linkRow('palette', 'Design system', 'the spacing, type and color scales', '/home')
                    ]
                })
            ]
        })
    });
};

export default ProfileScreen;

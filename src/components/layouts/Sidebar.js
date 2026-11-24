// components/layouts/Sidebar.js
import { Container, Column, Row, Text, Icon, colors, goTo, getCurrentPath } from 'flet-box';

// Scaffold re-runs this on every route change, so the active item can read the
// route itself instead of being rebuilt by the app.
export const Sidebar = ({ items = [] } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Start here', route: '/' },
        { icon: 'palette', label: 'Design system', route: '/home' },
        { icon: 'tune', label: 'Preferences', route: '/about' }
    ];
    const menuItems = items.length ? items : defaultItems;
    const currentRoute = getCurrentPath();
    // Scaffold puts this in a flex row *below* the app bar and sizes it with
    // leftNavBarWidth, so the sidebar has to stay in flow. A position: fixed
    // panel escapes that box: its header ends up hidden behind the bar and the
    // width prop stops meaning anything.
    return Column({
        height: '100%',
        backgroundColor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        children: [
            Container({
                padding: 24,
                borderBottom: `1px solid ${colors.border}`,
                child: Column({
                    alignItems: 'center',
                    children: [
                        Icon({ name: 'rocket_launch', size: 40, color: colors.primary }),
                        Text({ text: 'FletBox', size: 18, weight: 'bold', color: colors.text, marginTop: 12 })
                    ]
                })
            }),
            ...menuItems.map(item => Container({
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: currentRoute === item.route ? colors.primaryBg : 'transparent',
                borderLeft: currentRoute === item.route ? `3px solid ${colors.primary}` : 'none',
                child: Row({
                    gap: 12,
                    alignItems: 'center',
                    children: [
                        Icon({ name: item.icon, size: 20, color: currentRoute === item.route ? colors.primary : colors.textSecondary }),
                        Text({ text: item.label, size: 14, weight: currentRoute === item.route ? 'bold' : 'normal', color: colors.text })
                    ]
                }),
                onclick: () => goTo(item.route)
            }))
        ]
    });
};

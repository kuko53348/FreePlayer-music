// components/layouts/DrawerMenu.js
import { Drawer, DrawerItem, Container, Column, Text, Icon, colors, closeDrawer } from 'flet-box';

export const DrawerMenu = ({ items = [] } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Start here', route: '/' },
        { icon: 'palette', label: 'Design system', route: '/home' },
        { icon: 'tune', label: 'Preferences', route: '/about' }
    ];
    const menuItems = items.length ? items : defaultItems;
    return Drawer({
        header: Container({
            padding: 24,
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            child: Column({
                alignItems: 'center',
                children: [
                    Icon({ name: 'rocket_launch', size: 40, color: colors.primary }),
                    Text({ text: 'FletBox', size: 18, weight: 'bold', color: colors.text, marginTop: 12 }),
                    Text({ text: 'Starter app', size: 12, color: colors.textSecondary })
                ]
            })
        }),
        body: menuItems.map(item => DrawerItem({
            icon: item.icon,
            label: item.label,
            route: item.route,
            onPress: () => closeDrawer()
        })),
        footer: Container({
            padding: 16,
            borderTop: `1px solid ${colors.border}`,
            child: Text({ text: 'Version 1.0.0', size: 12, color: colors.textSecondary, align: 'center' })
        })
    });
};

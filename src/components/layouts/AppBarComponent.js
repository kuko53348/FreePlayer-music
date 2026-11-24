// components/layouts/AppBarComponent.js
import { AppBar, Icon, Tooltip, colors, openDrawer, toggleTheme, getTheme } from 'flet-box';

// The bar is neutral — the surface token, not the brand — because a coloured strip
// on every screen competes with the one action the screen is asking for. One
// elevation step is enough to keep it off the page.
//
// It reads the theme instead of subscribing to it: setTheme() re-renders the app,
// so a component that subscribed would add a listener on every render and never
// remove it.
export const AppBarComponent = ({ title, isMobile = false, showBack = false, onBack = () => {} }) => {
    const isDark = getTheme() === 'dark';

    return AppBar({
        title: title,
        backgroundColor: colors.surface,
        titleColor: colors.text,
        iconColor: colors.text,
        centerTitle: false,
        showBackButton: showBack,
        leading: isMobile ? Tooltip({
            text: 'Open the menu',
            position: 'bottom',
            child: Icon({
                name: 'menu',
                size: 24,
                height: 40,
                color: colors.text,
                'aria-label': 'Open the menu',
                onclick: () => openDrawer()
            })
        }) : null,
        // An icon-only control still needs a name, and a Tooltip is a description
        // (aria-describedby), not a name: the aria-label is what a screen reader says.
        actions: [
            Tooltip({
                text: isDark ? 'Switch to light' : 'Switch to dark',
                position: 'bottom',
                child: Icon({
                    name: isDark ? 'light_mode' : 'dark_mode',
                    size: 24,
                    height: 40,
                    color: colors.text,
                    'aria-label': isDark ? 'Switch to light' : 'Switch to dark',
                    onclick: () => toggleTheme()
                })
            })
        ],
        onBackPress: onBack,
        elevation: 1
    });
};

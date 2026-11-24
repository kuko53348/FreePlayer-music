// components/layouts/BottomNav.js
import { BottomNavigation, colors, goTo, getCurrentPath } from 'flet-box';

// Scaffold re-runs this on every route change, which is why the current path is
// read here rather than passed in by the app.
export const BottomNav = ({ items = [] } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Start', route: '/' },
        { icon: 'palette', label: 'System', route: '/home' },
        { icon: 'tune', label: 'Preferences', route: '/about' }
    ];
    const navItems = items.length ? items : defaultItems;
    // BottomNavigation selects a tab by index, not by route.
    const currentIndex = Math.max(0, navItems.findIndex((item) => item.route === getCurrentPath()));
    return BottomNavigation({
        items: navItems,
        currentIndex,
        onTabChange: (index) => goTo(navItems[index].route),
        backgroundColor: colors.surface,
        selectedColor: colors.primary
    });
};

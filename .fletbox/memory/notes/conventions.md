# Conventions

- **Events**: use `onPress` instead of `onClick` for FletBox widgets. `onClick` was replaced/aliased by `onPress` in FletBox conventions for this project.
- **Props**: prefer real FletBox widget props (className, bgColor, padding, display, etc.) over escape hatches. Avoid `style` objects; pass flat CSS props.

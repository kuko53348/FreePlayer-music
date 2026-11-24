// screens/RootScreen.js
// This screen is a reference implementation of the app's own design contract:
// colors only from the tokens, spacing/radius/type only from the scale, one
// filled action per screen. The gate that enforces it is 'npm run ui'.
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const RootScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            alignItems: 'center',
            children: [
                Container({
                    width: 96,
                    height: 96,
                    borderRadius: 16,
                    backgroundColor: colors.primaryBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 48, color: colors.primary })
                }),
                Column({
                    gap: 8,
                    alignItems: 'center',
                    children: [
                        Text({ text: 'FletBox', size: 40, weight: 'bold', color: colors.text }),
                        // A lead is a sentence, not a paragraph: at desktop width this
                        // line would sit on 120 characters and no eye can track it.
                        Text({
                            text: 'A screen, in plain JavaScript.',
                            size: 16,
                            color: colors.textSecondary,
                            align: 'center'
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    alignItems: 'stretch',
                    maxWidth: 280,
                    children: [
                        // A filled Button defaults to colors.surface, not to the brand:
                        // the primary action has to name the fill it wants.
                        Button({
                            text: 'See the design system',
                            iconRight: 'arrow_forward',
                            bgColor: colors.primary,
                            color: colors.onPrimary,
                            fullWidth: true,
                            onPress: () => goTo('/home')
                        }),
                        // One accent per screen: everything that is not the ask is quiet.
                        Button({
                            text: 'Preferences',
                            variant: 'text',
                            color: colors.text,
                            fullWidth: true,
                            onPress: () => goTo('/about')
                        })
                    ]
                })
            ]
        })
    });
};

export default RootScreen;

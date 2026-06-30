import { StyleSheet } from 'react-native';
import { theme } from './theme';


export const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
        marginHorizontal: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    imageContainer: {
        position: 'relative',
        backgroundColor: '#fafafa',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: theme.borderRadius.sm,
    },
    discountBadge: {
        position: 'absolute',
        top: -4,
        left: -4,
        backgroundColor: theme.colors.danger,
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
        ...theme.shadows.sm,
    },
    discountBadgeText: {
        color: theme.colors.white,
        fontSize: 10,
        fontWeight: '800',
    },
    infoContainer: {
        flex: 1,
        marginLeft: theme.spacing.md,
        height: 95,
        justifyContent: 'space-between',
    },
    brand: {
        fontSize: 10,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: theme.spacing.xs,
    },
    priceContainer: {
        justifyContent: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
        marginBottom: 1,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.danger,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.round,
    },
    stockIn: {
        backgroundColor: theme.colors.successLight,
    },
    stockOut: {
        backgroundColor: theme.colors.dangerLight,
    },
    stockDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '700',
    },
});

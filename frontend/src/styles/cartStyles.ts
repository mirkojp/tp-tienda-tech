import { StyleSheet } from 'react-native';
import { theme } from './theme';


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        ...theme.shadows.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    clearText: {
        color: theme.colors.danger,
        fontWeight: '700',
        fontSize: 14,
    },
    listContent: {
        paddingVertical: theme.spacing.md,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
        marginHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    itemImageContainer: {
        backgroundColor: '#fafafa',
        padding: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.sm,
    },
    itemInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
        marginRight: theme.spacing.sm,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    itemPrice: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: theme.colors.background,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        lineHeight: 18,
    },
    quantityText: {
        marginHorizontal: theme.spacing.sm,
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    deleteButton: {
        marginLeft: theme.spacing.md,
        padding: theme.spacing.xs,
    },
    deleteText: {
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: theme.spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
        opacity: 0.5,
    },
    emptyText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    emptySubtext: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    footer: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.lg,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    checkoutButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...theme.shadows.sm,
    },
    disabledButton: {
        backgroundColor: theme.colors.successLight,
    },
    checkoutButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    }
});
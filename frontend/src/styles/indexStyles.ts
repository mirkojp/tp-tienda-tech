import { StyleSheet } from 'react-native';
import { theme } from './theme';



export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  searchInput: {
    height: 42,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterTitleInline: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    marginVertical: theme.spacing.xs,
  },
  chipRowContainer: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.md,
  },
  chip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  orderButtons: {
    flexDirection: 'row',
  },
  orderBtn: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orderBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  orderBtnText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  orderBtnTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: theme.spacing.md,
  },
  cardWrapper: {
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  pageBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  pageBtnDisabled: {
    backgroundColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  pageBtnText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  pageBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
  pageInfoContainer: {
    alignItems: 'center',
  },
  pageInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pageSubInfoText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'

export const statusConfig = {
  success: {
    icon: CheckmarkCircle02Icon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ringColor: 'ring-emerald-500/20',
    label: 'Success',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  failure: {
    icon: Cancel01Icon,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    ringColor: 'ring-red-500/20',
    label: 'Failed',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  cancelled: {
    icon: AlertCircleIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    ringColor: 'ring-amber-500/20',
    label: 'Cancelled',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
} as const

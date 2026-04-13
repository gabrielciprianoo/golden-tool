import { getStateLabel, getStateStyle } from '../../utils/toolUtils'

interface ToolStateBadgeProps {
  state: string
}

export const ToolStateBadge = ({ state }: ToolStateBadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStateStyle(state)}`}>
    {getStateLabel(state)}
  </span>
)

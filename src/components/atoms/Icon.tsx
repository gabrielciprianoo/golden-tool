import type { IconProps } from '../../types'
import clsx from 'clsx'

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className,
}) => {
  return (
    <svg
      className={clsx('icon', className)}
      width={size}
      height={size}
      role="presentation"
      aria-hidden="true"
    >
      <use href={`/icons.svg#${name}-icon`} />
    </svg>
  )
}

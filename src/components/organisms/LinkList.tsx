import type { LinkListProps } from '../../types'
import { Icon } from '../atoms/Icon'

export const LinkList: React.FC<LinkListProps> = ({
  title,
  icon,
  links,
}) => {
  return (
    <div className="link-list" id={title.toLowerCase().replace(/\s+/g, '-')}>
      <div className="link-list__header">
        {icon && <Icon name={icon} className="link-list__icon" />}
        <h2 className="link-list__title">{title}</h2>
      </div>
      <p className="link-list__description">
        {title === 'Documentation' ? 'Your questions, answered' : 'Join the community'}
      </p>
      <ul className="link-list__items">
        {links.map((link) => (
          <li key={link.href} className="link-list__item">
            <a
              href={link.href}
              className="link-list__link"
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.icon && <Icon name={link.icon} className="link-list__link-icon" />}
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

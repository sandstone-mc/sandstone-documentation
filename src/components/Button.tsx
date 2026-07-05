import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import theme from '../css/theme.module.css'

type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm'

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

interface ButtonLinkProps extends ButtonOwnProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'> {
  to: string
  href?: never
}

interface ButtonAnchorProps extends ButtonOwnProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'> {
  href: string
  to?: never
}

interface ButtonActionProps extends ButtonOwnProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  to?: never
  href?: never
}

export type ButtonProps = ButtonLinkProps | ButtonAnchorProps | ButtonActionProps

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props

  const classes = clsx(
    theme.button,
    variant === 'primary' && theme.buttonPrimary,
    variant === 'secondary' && theme.buttonSecondary,
    size === 'sm' && theme.buttonSm,
    className,
  )

  // internal link
  if ('to' in rest && rest.to) {
    const { to, ...anchorRest } = rest as ButtonLinkProps
    return (
      <Link className={classes} to={to} {...anchorRest}>
        {children}
      </Link>
    )
  }

  // external link
  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as ButtonAnchorProps
    return (
      <a className={classes} href={href} {...anchorRest}>
        {children}
      </a>
    )
  }

  // other
  const { to: _to, href: _href, ...buttonRest } = rest as ButtonActionProps
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  )
}

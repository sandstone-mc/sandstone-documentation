import { useEffect } from 'react'
import type { ShowcaseImage } from './types'
import styles from './Lightbox.module.css'

interface LightboxProps {
  image: ShowcaseImage | null
  onClose: () => void
}

export function Lightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    if (!image) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [image, onClose])

  if (!image) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose} aria-label="Close">
        ✕
      </button>
      <div className={styles.content} onClick={(event) => event.stopPropagation()}>
        <img className={styles.image} src={image.src} alt={image.alt} />
        {image.alt && <p className={styles.caption}>{image.alt}</p>}
      </div>
    </div>
  )
}

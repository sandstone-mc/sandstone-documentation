import { useState, type KeyboardEvent } from 'react'
import clsx from 'clsx'
import { Panel } from '../Panel'
import type { ShowcaseImage } from './types'
import styles from './Showcase.module.css'

interface GalleryCarouselProps {
  images: ShowcaseImage[]
  onImageClick: (image: ShowcaseImage) => void
}

export function GalleryCarousel({ images, onImageClick }: GalleryCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) return null

  const activeImage = images[activeIndex]
  const goTo = (index: number) => setActiveIndex((index + images.length) % images.length)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') goTo(activeIndex - 1)
    if (event.key === 'ArrowRight') goTo(activeIndex + 1)
  }

  return (
    <div className={styles.carousel}>
      <Panel
        className={styles.carouselMainPanel}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {images.length > 1 && (
          <button
            type="button"
            className={clsx(styles.carouselNav, styles.carouselNavPrev)}
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous image"
          >
            &lsaquo;
          </button>
        )}
        <button
          type="button"
          className={styles.carouselMainButton}
          onClick={() => onImageClick(activeImage)}
          aria-label={`View larger image: ${activeImage.alt}`}
        >
          <img src={activeImage.src} alt={activeImage.alt} className={styles.carouselMainImage} />
        </button>
        {images.length > 1 && (
          <button
            type="button"
            className={clsx(styles.carouselNav, styles.carouselNavNext)}
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next image"
          >
            &rsaquo;
          </button>
        )}
      </Panel>

      {images.length > 1 && (
        <div className={styles.thumbnailStrip}>
          {images.map((image, idx) => (
            <button
              key={image.src}
              type="button"
              className={clsx(styles.thumbnailButton, idx === activeIndex && styles.thumbnailActive)}
              onClick={() => goTo(idx)}
              aria-label={`Show image ${idx + 1}: ${image.alt}`}
              aria-current={idx === activeIndex}
            >
              <img src={image.src} alt="" className={styles.thumbnailImage} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

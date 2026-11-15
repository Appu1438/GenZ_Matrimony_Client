import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { photoUrl } from "../../utils/imageUtils.js";
import "./PhotoLightBox.css";

const iconProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true };
const strokeProps = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

const CloseIcon = () => (<svg {...iconProps}><path d="M6 6l12 12M18 6L6 18" {...strokeProps} /></svg>);
const PrevIcon = () => (<svg {...iconProps}><path d="M15 5l-7 7 7 7" {...strokeProps} /></svg>);
const NextIcon = () => (<svg {...iconProps}><path d="M9 5l7 7-7 7" {...strokeProps} /></svg>);

const SWIPE_DISTANCE = 50;

/**
 * Full-screen photo viewer.
 *   photos          [{ url, isProfile? }]
 *   index           index currently shown, or null when closed
 *   onIndexChange   called with the new index (arrows, thumbnails, keys, swipe)
 *   onClose         called on Esc, backdrop click or the close button
 * Keyboard: Esc closes, ← → navigate, Tab stays inside the dialog.
 * Locks page scroll while open and returns focus to the trigger on close.
 */
export default function PhotoLightbox({ photos, index, onIndexChange, onClose, label = "Photos" }) {
    const dialogRef = useRef(null);
    const closeButton = useRef(null);
    const thumbRefs = useRef([]);
    const touchStartX = useRef(null);
    const [loaded, setLoaded] = useState(false);

    const count = photos.length;
    const photo = index !== null ? photos[index] : null;
    const isOpen = Boolean(photo);

    const go = useCallback(
        (step) => onIndexChange((index + step + count) % count),
        [index, count, onIndexChange]
    );

    // Lock page scroll, move focus in, and restore focus on close.
    useEffect(() => {
        if (!isOpen) return undefined;

        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButton.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [isOpen]);

    // Keyboard controls + focus trap.
    useEffect(() => {
        if (!isOpen) return undefined;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            } else if (event.key === "ArrowRight" && count > 1) {
                go(1);
            } else if (event.key === "ArrowLeft" && count > 1) {
                go(-1);
            } else if (event.key === "Tab") {
                const focusable = dialogRef.current?.querySelectorAll("button:not([disabled])");
                if (!focusable?.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, count, go, onClose]);

    // New photo: show the loading state, preload neighbours, keep the thumbnail in view.
    useEffect(() => {
        if (!isOpen) return;

        setLoaded(false);

        [index - 1, index + 1].forEach((neighbour) => {
            const target = photos[(neighbour + count) % count];
            if (target && count > 1) new Image().src = photoUrl(target.url, { width: 1600, fit: "limit" });
        });

        thumbRefs.current[index]?.scrollIntoView?.({ inline: "center", block: "nearest" });
    }, [isOpen, index, count, photos]);

    if (!isOpen) return null;

    function handleImageError(event) {
        const image = event.currentTarget;
        if (image.dataset.fallback) {
            setLoaded(true);
            return;
        }
        image.dataset.fallback = "true";
        image.src = photo.url;
    }

    function handleTouchEnd(event) {
        if (touchStartX.current === null || count < 2) return;

        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;

        if (Math.abs(distance) >= SWIPE_DISTANCE) go(distance < 0 ? 1 : -1);
    }

    return createPortal(
        <div
            ref={dialogRef}
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            <div className="photo-lightbox__bar">
                <span className="photo-lightbox__count" aria-live="polite">
                    {photo.isProfile ? "Profile photo · " : ""}{index + 1} / {count}
                </span>

                <button
                    ref={closeButton}
                    type="button"
                    className="photo-lightbox__icon-button"
                    aria-label="Close photo viewer"
                    onClick={onClose}
                >
                    <CloseIcon />
                </button>
            </div>

            <div
                className="photo-lightbox__stage"
                onClick={(event) => event.target === event.currentTarget && onClose()}
                onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
                onTouchEnd={handleTouchEnd}
            >
                {count > 1 && (
                    <button
                        type="button"
                        className="photo-lightbox__icon-button photo-lightbox__nav photo-lightbox__nav--prev"
                        aria-label="Previous photo"
                        onClick={() => go(-1)}
                    >
                        <PrevIcon />
                    </button>
                )}

                <figure className={`photo-lightbox__figure ${loaded ? "is-loaded" : ""}`.trim()}>
                    <img
                        key={index}
                        src={photoUrl(photo.url, { width: 1600, fit: "limit" })}
                        alt={photo.isProfile ? "Profile photo" : `Photo ${index + 1}`}
                        onLoad={() => setLoaded(true)}
                        onError={handleImageError}
                        draggable={false}
                    />
                </figure>

                {count > 1 && (
                    <button
                        type="button"
                        className="photo-lightbox__icon-button photo-lightbox__nav photo-lightbox__nav--next"
                        aria-label="Next photo"
                        onClick={() => go(1)}
                    >
                        <NextIcon />
                    </button>
                )}
            </div>

            {count > 1 && (
                <div className="photo-lightbox__thumbs" role="group" aria-label="Choose a photo">
                    {photos.map((item, itemIndex) => (
                        <button
                            key={item.publicId || item.url}
                            ref={(element) => { thumbRefs.current[itemIndex] = element; }}
                            type="button"
                            className={`photo-lightbox__thumb ${itemIndex === index ? "is-active" : ""}`.trim()}
                            aria-label={`Show photo ${itemIndex + 1}`}
                            aria-current={itemIndex === index ? "true" : undefined}
                            onClick={() => onIndexChange(itemIndex)}
                        >
                            <img
                                src={photoUrl(item.url, { width: 120, height: 120 })}
                                alt=""
                                loading="lazy"
                                decoding="async"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
}
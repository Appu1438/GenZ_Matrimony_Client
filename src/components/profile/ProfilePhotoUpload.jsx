
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import Button from "../ui/Button.jsx";
import { useProfile } from "../../hooks/useProfile.js";
import { optimizeImage, thumbnailUrl } from "../../utils/imageUtils.js";

import "./ProfilePhotoUpload.css";

const MAX_GALLERY_PHOTOS = 5;
const MAX_INPUT_SIZE = 30 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT = ACCEPTED_TYPES.join(",");

function getFileError(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return "Choose a JPG, PNG or WebP image.";
    }

    if (file.size > MAX_INPUT_SIZE) {
        return "Image must be 30 MB or smaller.";
    }

    return null;
}

/* ---- Icons ---- */

const iconProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
};

const strokeProps = {
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

const CameraIcon = () => (
    <svg {...iconProps}>
        <path
            d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z"
            {...strokeProps}
        />
        <circle cx="12" cy="13" r="3.5" {...strokeProps} />
    </svg>
);

const PlusIcon = () => (
    <svg {...iconProps}>
        <path d="M12 5v14M5 12h14" {...strokeProps} />
    </svg>
);

const CloseIcon = () => (
    <svg {...iconProps} width="14" height="14">
        <path
            d="M6 6l12 12M18 6L6 18"
            {...strokeProps}
            strokeWidth="2.4"
        />
    </svg>
);

/* ---- Photo image ---- */

function PhotoImage({ photo, size, alt, face = false, eager = false }) {
    const src = thumbnailUrl(photo.url, size, { face });
    const isResized = src !== photo.url;

    function fallBackToOriginal(event) {
        const image = event.currentTarget;

        if (image.dataset.fallback) return;

        image.dataset.fallback = "true";
        image.removeAttribute("srcset");
        image.src = photo.url;
    }

    return (
        <img
            src={src}
            srcSet={
                isResized
                    ? `${src} 1x, ${thumbnailUrl(photo.url, size * 2, { face })} 2x`
                    : undefined
            }
            alt={alt}
            width={size}
            height={size}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={fallBackToOriginal}
        />
    );
}

/* ---- Inline delete confirmation ---- */

function ConfirmDelete({ onConfirm, onCancel, inline = false }) {
    const keepButton = useRef(null);

    useEffect(() => {
        keepButton.current?.focus();
    }, []);

    return (
        <div
            className={`photo-confirm ${inline ? "photo-confirm--inline" : ""}`.trim()}
            role="group"
            aria-label="Confirm delete"
            onKeyDown={(event) =>
                event.key === "Escape" && onCancel()
            }
        >
            <span>Delete this photo?</span>

            <div className="photo-confirm__buttons">
                <button
                    type="button"
                    className="photo-confirm__delete"
                    onClick={onConfirm}
                >
                    Delete
                </button>

                <button
                    type="button"
                    className="photo-confirm__keep"
                    ref={keepButton}
                    onClick={onCancel}
                >
                    Keep
                </button>
            </div>
        </div>
    );
}

/* ==========================================================================
   Main component
   ========================================================================== */

export default function ProfilePhotoUpload({
    photos,
    onChange,
    disabled = false,
    isRevisionMode = false,
}) {
    const {
        uploadProfilePhoto,
        uploadGalleryPhoto,
        deleteProfilePhoto,

        uploadRevisionProfilePhoto,
        uploadRevisionGalleryPhoto,
        deleteRevisionPhoto,
    } = useProfile();

    const headingId = useId();

    const profileInput = useRef(null);
    const galleryInput = useRef(null);
    const workingLock = useRef(false);
    const previewUrls = useRef(new Set());

    const [pending, setPending] = useState([]);
    const [working, setWorking] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [dragTarget, setDragTarget] = useState(null);
    const [status, setStatus] = useState("");

    const profilePhoto = photos?.profilePhoto || null;

    const gallery = Array.isArray(photos?.gallery)
        ? photos.gallery
        : [];

    const pendingProfile = pending.find(
        (item) => item.kind === "profile"
    );

    const pendingGallery = pending.filter(
        (item) => item.kind === "gallery"
    );

    const remainingSlots =
        MAX_GALLERY_PHOTOS -
        gallery.length -
        pendingGallery.length;

    const busy =
        disabled ||
        working ||
        Boolean(deletingId);

    // Free preview blobs if the component unmounts mid-upload.
    useEffect(() => {
        const urls = previewUrls.current;

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    // =========================================================
    // Upload Photo
    // =========================================================

    async function uploadFile(kind, file) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const previewUrl = URL.createObjectURL(file);

        previewUrls.current.add(previewUrl);

        setPending((current) => [
            ...current,
            { id, kind, previewUrl },
        ]);

        try {
            const ready = await optimizeImage(file);

            if (ready.size > MAX_UPLOAD_SIZE) {
                toast.error(
                    "This photo is still over 10 MB after resizing. Try a different one."
                );

                return false;
            }

            let result;

            if (isRevisionMode) {
                result =
                    kind === "profile"
                        ? await uploadRevisionProfilePhoto(ready)
                        : await uploadRevisionGalleryPhoto(ready);
            } else {
                result =
                    kind === "profile"
                        ? await uploadProfilePhoto(ready)
                        : await uploadGalleryPhoto(ready);
            }

            // Update ProfileSetup local state.
            onChange(result.photos);

            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                (
                    kind === "profile"
                        ? "Unable to upload profile photo."
                        : "Unable to upload photo."
                )
            );

            return false;
        } finally {
            URL.revokeObjectURL(previewUrl);
            previewUrls.current.delete(previewUrl);

            setPending((current) =>
                current.filter((item) => item.id !== id)
            );
        }
    }

    // =========================================================
    // Handle Selected Files
    // =========================================================

    async function handleFiles(kind, fileList) {
        if (disabled || workingLock.current) return;

        let files = Array.from(fileList || []);

        if (!files.length) return;

        if (kind === "profile") {
            files = files.slice(0, 1);
        }

        const valid = [];
        let firstError = "";
        let skipped = 0;

        files.forEach((file) => {
            const error = getFileError(file);

            if (error) {
                skipped += 1;

                if (!firstError) {
                    firstError = error;
                }
            } else {
                valid.push(file);
            }
        });

        if (skipped) {
            toast.error(
                skipped > 1
                    ? `${firstError} (${skipped} files skipped)`
                    : firstError
            );
        }

        let queue = valid;

        if (kind === "gallery") {
            if (remainingSlots <= 0) {
                toast.error(
                    `You can add up to ${MAX_GALLERY_PHOTOS} extra photos.`
                );

                return;
            }

            if (queue.length > remainingSlots) {
                toast(
                    `Only ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} fit — the rest were skipped.`
                );

                queue = queue.slice(0, remainingSlots);
            }
        }

        if (!queue.length) return;

        workingLock.current = true;
        setWorking(true);

        let uploaded = 0;

        // Upload sequentially because the server returns the full photo list.
        for (let index = 0; index < queue.length; index += 1) {
            setStatus(
                `Uploading photo ${index + 1} of ${queue.length}…`
            );

            if (await uploadFile(kind, queue[index])) {
                uploaded += 1;
            }
        }

        workingLock.current = false;
        setWorking(false);

        if (uploaded) {
            const message =
                kind === "profile"
                    ? "Profile photo updated."
                    : uploaded === 1
                        ? "Photo added."
                        : `${uploaded} photos added.`;

            toast.success(message);
            setStatus(message);
        } else {
            setStatus("");
        }
    }

    // =========================================================
    // Delete Photo
    // =========================================================

    async function handleDelete(photo) {
        if (!photo?.publicId || busy) return;

        setConfirmId(null);
        setDeletingId(photo.publicId);

        try {
            const result = isRevisionMode
                ? await deleteRevisionPhoto(photo.publicId)
                : await deleteProfilePhoto(photo.publicId);

            onChange(result.photos);

            toast.success("Photo deleted.");
            setStatus("Photo deleted.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to delete photo."
            );
        } finally {
            setDeletingId(null);
        }
    }

    // =========================================================
    // Drag and Drop
    // =========================================================

    function dropProps(kind) {
        if (busy) return {};

        return {
            onDragOver: (event) => {
                event.preventDefault();
                setDragTarget(kind);
            },

            onDragLeave: (event) => {
                if (
                    !event.currentTarget.contains(event.relatedTarget)
                ) {
                    setDragTarget(null);
                }
            },

            onDrop: (event) => {
                event.preventDefault();
                setDragTarget(null);

                handleFiles(kind, event.dataTransfer.files);
            },
        };
    }

    function pickFiles(kind, event) {
        const { files } = event.target;

        handleFiles(kind, files).finally(() => {
            // Allow choosing the same file again.
            event.target.value = "";
        });
    }

    const confirmingProfile =
        Boolean(profilePhoto) &&
        confirmId === profilePhoto.publicId;

    // =========================================================
    // Render
    // =========================================================

    return (
        <section
            className="photo-upload"
            aria-labelledby={headingId}
        >
            <p
                className="visually-hidden"
                role="status"
                aria-live="polite"
            >
                {status}
            </p>

            {/* Profile photo */}

            <div className="photo-upload__block">
                <h3
                    id={headingId}
                    className="photo-upload__title"
                >
                    Profile photo
                </h3>

                <p className="photo-upload__text">
                    {isRevisionMode
                        ? "Choose the profile photo you want to propose. Your currently approved photo remains visible until your changes are approved."
                        : "Use a clear, recent photo where your face is visible. Your profile stays hidden until an administrator approves it."}
                </p>

                <div
                    className={`photo-card ${dragTarget === "profile" ? "is-dragging" : ""}`.trim()}
                    {...dropProps("profile")}
                >
                    <button
                        type="button"
                        className={`photo-avatar ${profilePhoto || pendingProfile ? "has-photo" : ""}`.trim()}
                        disabled={busy}
                        aria-label={
                            profilePhoto
                                ? "Change profile photo"
                                : "Upload profile photo"
                        }
                        onClick={() =>
                            profileInput.current?.click()
                        }
                    >
                        {pendingProfile ? (
                            <img
                                src={pendingProfile.previewUrl}
                                alt=""
                            />
                        ) : profilePhoto?.url ? (
                            <PhotoImage
                                photo={profilePhoto}
                                size={240}
                                alt="Your profile"
                                face
                                eager
                            />
                        ) : (
                            <span className="photo-avatar__empty">
                                <CameraIcon />
                                <span>Add photo</span>
                            </span>
                        )}

                        {pendingProfile ||
                            deletingId === profilePhoto?.publicId ? (
                            <span
                                className="photo-spinner"
                                aria-hidden="true"
                            />
                        ) : (
                            profilePhoto && (
                                <span
                                    className="photo-avatar__hover"
                                    aria-hidden="true"
                                >
                                    <CameraIcon />
                                </span>
                            )
                        )}
                    </button>

                    <div className="photo-card__body">
                        <strong>
                            {profilePhoto
                                ? "Profile photo added"
                                : "No profile photo yet"}
                        </strong>

                        <p>
                            JPG, PNG or WebP. Large photos are resized
                            automatically. You can also drop a photo here.
                        </p>

                        <input
                            ref={profileInput}
                            type="file"
                            accept={ACCEPT}
                            onChange={(event) =>
                                pickFiles("profile", event)
                            }
                            hidden
                        />

                        {confirmingProfile ? (
                            <ConfirmDelete
                                inline
                                onConfirm={() =>
                                    handleDelete(profilePhoto)
                                }
                                onCancel={() => setConfirmId(null)}
                            />
                        ) : (
                            <div className="photo-card__actions">
                                <Button
                                    variant="secondary"
                                    disabled={busy}
                                    isLoading={Boolean(pendingProfile)}
                                    loadingText="Uploading…"
                                    onClick={() =>
                                        profileInput.current?.click()
                                    }
                                >
                                    {profilePhoto
                                        ? "Change photo"
                                        : "Upload photo"}
                                </Button>

                                {profilePhoto && (
                                    <button
                                        type="button"
                                        className="photo-upload__danger-link"
                                        disabled={busy}
                                        onClick={() =>
                                            setConfirmId(profilePhoto.publicId)
                                        }
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gallery */}

            <div className="photo-upload__block">
                <h3 className="photo-upload__title">
                    More photos
                </h3>

                <p className="photo-upload__text">
                    {gallery.length} of {MAX_GALLERY_PHOTOS} added · optional.
                    Select several at once or drop them here.
                </p>

                <div
                    className={`photo-gallery ${dragTarget === "gallery" ? "is-dragging" : ""}`.trim()}
                    {...dropProps("gallery")}
                >
                    <input
                        ref={galleryInput}
                        type="file"
                        accept={ACCEPT}
                        multiple
                        onChange={(event) =>
                            pickFiles("gallery", event)
                        }
                        hidden
                    />

                    <ul className="photo-gallery__grid">
                        {gallery.map((photo, index) => (
                            <li
                                className="photo-tile"
                                key={photo.publicId}
                            >
                                <PhotoImage
                                    photo={photo}
                                    size={240}
                                    alt={`Additional photo ${index + 1}`}
                                />

                                {confirmId === photo.publicId ? (
                                    <ConfirmDelete
                                        onConfirm={() =>
                                            handleDelete(photo)
                                        }
                                        onCancel={() =>
                                            setConfirmId(null)
                                        }
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        className="photo-tile__remove"
                                        aria-label={`Delete photo ${index + 1}`}
                                        disabled={busy}
                                        onClick={() =>
                                            setConfirmId(photo.publicId)
                                        }
                                    >
                                        <CloseIcon />
                                    </button>
                                )}

                                {deletingId === photo.publicId && (
                                    <span
                                        className="photo-spinner"
                                        aria-hidden="true"
                                    />
                                )}
                            </li>
                        ))}

                        {pendingGallery.map((item) => (
                            <li
                                className="photo-tile"
                                key={item.id}
                            >
                                <img
                                    src={item.previewUrl}
                                    alt=""
                                />

                                <span
                                    className="photo-spinner"
                                    aria-hidden="true"
                                />
                            </li>
                        ))}

                        {remainingSlots > 0 && (
                            <li>
                                <button
                                    type="button"
                                    className="photo-add-tile"
                                    disabled={busy}
                                    onClick={() =>
                                        galleryInput.current?.click()
                                    }
                                >
                                    <PlusIcon />
                                    <span>Add photos</span>
                                    <small>{remainingSlots} left</small>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
}

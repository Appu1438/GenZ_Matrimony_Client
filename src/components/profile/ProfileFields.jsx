import { Fragment, useEffect, useId, useRef, useState } from "react";
import { OTHER, readPath, toGroups } from "../../pages/onboarding/profileOptions.js";

/* ==========================================================================
   Field controls for the profile form.
   ProfileField picks the right control for `field.type`:
     text | number | date | combobox | select | choice | stepper |
     multi-select | textarea
   ========================================================================== */

const isBlank = (value) => value === undefined || value === null || value === "";

function yearsFromToday(years) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().slice(0, 10);
}
const LATEST_BIRTH_DATE = yearsFromToday(-18);
const EARLIEST_BIRTH_DATE = yearsFromToday(-100);

/* ---- Icons ---- */
const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true };
const stroke = { stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };

const CheckIcon = () => (
    <svg {...icon} width="13" height="13"><path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} /></svg>
);
const SearchIcon = () => (
    <svg {...icon}><circle cx="11" cy="11" r="7" {...stroke} /><path d="M20 20l-3.5-3.5" {...stroke} /></svg>
);
const MinusIcon = () => (<svg {...icon}><path d="M5 12h14" {...stroke} /></svg>);
const PlusIcon = () => (<svg {...icon}><path d="M12 5v14M5 12h14" {...stroke} /></svg>);
const CloseIcon = () => (
    <svg {...icon} width="12" height="12"><path d="M6 6l12 12M18 6L6 18" {...stroke} /></svg>
);

/* ==========================================================================
   Text, number, date and combobox (input + suggestions)
   ========================================================================== */
function TextControl({ field, value, onChange, id, aria }) {
    const listId = useId();
    const type = field.type || "text";
    const isDate = type === "date";
    const isNumber = type === "number";
    const isCombobox = type === "combobox";
    const displayValue = isDate && value ? String(value).slice(0, 10) : value ?? "";

    function handleChange(event) {
        let next = event.target.value;
        if (isNumber) next = next === "" ? null : Number(next);
        else if (isDate && next) next = new Date(`${next}T00:00:00.000Z`).toISOString();
        onChange(next);
    }

    const input = (
        <input
            id={id}
            className="profile-input"
            type={isCombobox ? "text" : type}
            inputMode={isNumber ? "numeric" : undefined}
            value={displayValue}
            min={isDate ? EARLIEST_BIRTH_DATE : field.min}
            max={isDate ? LATEST_BIRTH_DATE : field.max}
            maxLength={field.maxLength}
            placeholder={field.placeholder || ""}
            autoComplete="off"
            list={isCombobox ? listId : undefined}
            onWheel={isNumber ? (event) => event.currentTarget.blur() : undefined}
            onChange={handleChange}
            {...aria}
        />
    );

    const control = field.prefix || field.suffix ? (
        <div className="profile-affix">
            {field.prefix && <span className="profile-affix__text">{field.prefix}</span>}
            {input}
            {field.suffix && <span className="profile-affix__text">{field.suffix}</span>}
        </div>
    ) : input;

    return (
        <>
            {control}
            {isCombobox && (
                <datalist id={listId}>
                    {(field.options || []).map((option) => <option key={option} value={option} />)}
                </datalist>
            )}
        </>
    );
}

/* ==========================================================================
   Select (long lists). `allowOther` adds an "Other" entry that reveals a
   "please specify" input; the typed text becomes the stored value.
   ========================================================================== */
function SelectControl({ field, value, onChange, id, aria }) {
    const otherInput = useRef(null);
    const shouldFocusOther = useRef(false);

    const groups = toGroups(field.options);
    const knownValues = groups.flatMap((group) => group.items.map((item) => item.value));
    const hasValue = !isBlank(value);
    const isKnown = knownValues.includes(value);
    const isOther = Boolean(field.allowOther) && hasValue && (value === OTHER || !isKnown);
    const selectValue = isOther ? OTHER : hasValue ? value : "";
    const showFallback = hasValue && !isKnown && !field.allowOther;

    useEffect(() => {
        if (shouldFocusOther.current && otherInput.current) {
            otherInput.current.focus();
            shouldFocusOther.current = false;
        }
    });

    function handleSelectChange(event) {
        const next = event.target.value;
        if (next === OTHER) shouldFocusOther.current = true;
        onChange(next);
    }

    return (
        <>
            <select
                id={id}
                className="profile-select"
                value={selectValue}
                disabled={field.disabled}
                onChange={handleSelectChange}
                {...aria}
            >
                <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>

                {showFallback && <option value={value}>{String(value)}</option>}

                {groups.map((group, index) => {
                    const items = group.items.map((item) => (
                        <option value={item.value} key={item.value}>{item.label}</option>
                    ));
                    return group.label
                        ? <optgroup label={group.label} key={group.label}>{items}</optgroup>
                        : <Fragment key={index}>{items}</Fragment>;
                })}

                {field.allowOther && <option value={OTHER}>Other</option>}
            </select>

            {isOther && (
                <input
                    ref={otherInput}
                    className="profile-input profile-other-input"
                    type="text"
                    maxLength={60}
                    placeholder="Please specify"
                    aria-label={`${field.label} – please specify`}
                    value={value === OTHER ? "" : value}
                    onChange={(event) => onChange(event.target.value === "" ? OTHER : event.target.value)}
                    onBlur={(event) => {
                        const trimmed = event.target.value.trim();
                        if (value !== OTHER && trimmed !== value) onChange(trimmed || OTHER);
                    }}
                />
            )}
        </>
    );
}

/* ==========================================================================
   Choice — radio pills for short lists. Clicking the selected pill clears it
   (optional fields only).
   ========================================================================== */
function ChoiceControl({ field, value, onChange, labelId, aria }) {
    const items = toGroups(field.options).flatMap((group) => group.items);
    const options = !isBlank(value) && !items.some((item) => item.value === value)
        ? [...items, { value, label: String(value) }]
        : items;
    const clearedValue = typeof items[0]?.value === "boolean" ? null : "";

    return (
        <div className="profile-choice" role="radiogroup" aria-labelledby={labelId} {...aria}>
            {options.map((option) => {
                const selected = option.value === value;
                return (
                    <label
                        key={String(option.value)}
                        className={`profile-choice__option ${selected ? "is-selected" : ""}`.trim()}
                    >
                        <input
                            type="radio"
                            name={field.name}
                            checked={selected}
                            onChange={() => onChange(option.value)}
                            onClick={() => {
                                if (selected && !field.required) onChange(clearedValue);
                            }}
                        />
                        <span>{option.label}</span>
                    </label>
                );
            })}
        </div>
    );
}

/* ==========================================================================
   Stepper — small counts (siblings). `maxField` caps the value to another
   field (e.g. married brothers <= brothers).
   ========================================================================== */
function StepperControl({ field, value, values, onChange, id, labelId, aria }) {
    const min = field.min ?? 0;
    const cap = field.maxField ? readPath(values, field.maxField) : null;
    const max = !isBlank(cap) ? Number(cap) : field.max ?? 20;
    const current = isBlank(value) ? null : Number(value);
    const clamp = (number) => Math.min(max, Math.max(min, number));

    return (
        <div className="profile-stepper" role="group" aria-labelledby={labelId} {...aria}>
            <button
                type="button"
                className="profile-stepper__button"
                aria-label={`Decrease ${field.label.toLowerCase()}`}
                disabled={current !== null && current <= min}
                onClick={() => onChange(clamp((current ?? 0) - 1))}
            >
                <MinusIcon />
            </button>

            <input
                id={id}
                className="profile-stepper__input"
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={current ?? ""}
                placeholder="–"
                aria-label={field.label}
                onWheel={(event) => event.currentTarget.blur()}
                onChange={(event) => {
                    const raw = event.target.value;
                    onChange(raw === "" ? null : clamp(Number(raw)));
                }}
            />

            <button
                type="button"
                className="profile-stepper__button"
                aria-label={`Increase ${field.label.toLowerCase()}`}
                disabled={current !== null && current >= max}
                onClick={() => onChange(clamp((current ?? 0) + 1))}
            >
                <PlusIcon />
            </button>
        </div>
    );
}

/* ==========================================================================
   Multi-select chips
     searchable  – search box (auto when the list is long)
     allowCustom – type something that isn't listed and add it as a chip
     max         – cap on selections
     anyLabel    – adds a "Doesn't matter" chip (selected when nothing chosen)
   ========================================================================== */
function toList(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value) return value.split(",").map((item) => item.trim()).filter(Boolean);
    return [];
}

function MultiSelectControl({ field, value, onChange, labelId, aria }) {
    const [query, setQuery] = useState("");
    const selected = toList(value);

    const groups = toGroups(field.options);
    const allItems = groups.flatMap((group) => group.items);
    const optionValues = new Set(allItems.map((item) => item.value));
    const customSelected = selected.filter((item) => !optionValues.has(item));

    const searchable = field.searchable ?? (allItems.length > 12 || Boolean(field.allowCustom));
    const scrollable = allItems.length > 20;
    const atMax = Boolean(field.max) && selected.length >= field.max;

    const search = query.trim().toLowerCase();
    const visibleGroups = groups
        .map((group) => ({
            ...group,
            items: search ? group.items.filter((item) => item.label.toLowerCase().includes(search)) : group.items,
        }))
        .filter((group) => group.items.length);

    const alreadyThere =
        allItems.some((item) => item.label.toLowerCase() === search) ||
        selected.some((item) => item.toLowerCase() === search);
    const canAdd = Boolean(field.allowCustom) && Boolean(search) && !alreadyThere && !atMax;

    function toggle(itemValue) {
        if (selected.includes(itemValue)) onChange(selected.filter((item) => item !== itemValue));
        else if (!atMax) onChange([...selected, itemValue]);
    }

    function addCustom() {
        const text = query.trim().replace(/\s+/g, " ");
        if (!text || !canAdd) return;
        onChange([...selected, text]);
        setQuery("");
    }

    function handleSearchKeyDown(event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        if (canAdd) addCustom();
        else if (visibleGroups.length === 1 && visibleGroups[0].items.length === 1) {
            toggle(visibleGroups[0].items[0].value);
        }
    }

    const renderChip = (item) => {
        const isSelected = selected.includes(item.value);
        const disabled = !isSelected && atMax;
        return (
            <label
                key={item.value}
                className={`profile-chip ${isSelected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
            >
                <input type="checkbox" checked={isSelected} disabled={disabled} onChange={() => toggle(item.value)} />
                <span>{isSelected && <CheckIcon />}{item.label}</span>
            </label>
        );
    };

    return (
        <div className="profile-chips" role="group" aria-labelledby={labelId} {...aria}>
            <div className="profile-chips__toolbar">
                {searchable && (
                    <div className="profile-chips__search">
                        <SearchIcon />
                        <input
                            type="search"
                            value={query}
                            placeholder={field.allowCustom ? "Search or add your own" : "Search"}
                            aria-label={`Search ${field.label.toLowerCase()}`}
                            autoComplete="off"
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                )}

                <div className="profile-chips__meta">
                    <span aria-live="polite">
                        {selected.length}{field.max ? `/${field.max}` : ""} selected
                    </span>
                    {selected.length > 0 && (
                        <button type="button" className="profile-chips__clear" onClick={() => onChange([])}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className={`profile-chips__body ${scrollable ? "is-scrollable" : ""}`.trim()}>
                {field.anyLabel && !search && (
                    <div className="profile-chips__list">
                        <label
                            className={`profile-chip profile-chip--any ${selected.length === 0 ? "is-selected" : ""}`.trim()}
                        >
                            <input
                                type="checkbox"
                                checked={selected.length === 0}
                                onChange={() => onChange([])}
                            />
                            <span>{selected.length === 0 && <CheckIcon />}{field.anyLabel}</span>
                        </label>
                    </div>
                )}

                {visibleGroups.map((group, index) => (
                    <div className="profile-chips__group" key={group.label ?? index}>
                        {group.label && <p className="profile-chips__group-label">{group.label}</p>}
                        <div className="profile-chips__list">{group.items.map(renderChip)}</div>
                    </div>
                ))}

                {customSelected.length > 0 && (
                    <div className="profile-chips__group">
                        <p className="profile-chips__group-label">Added by you</p>
                        <div className="profile-chips__list">
                            {customSelected.map((item) => (
                                <span className="profile-chip profile-chip--custom is-selected" key={item}>
                                    <span>{item}</span>
                                    <button
                                        type="button"
                                        aria-label={`Remove ${item}`}
                                        onClick={() => toggle(item)}
                                    >
                                        <CloseIcon />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {canAdd && (
                    <div className="profile-chips__list">
                        <button type="button" className="profile-chip profile-chip--add" onClick={addCustom}>
                            <PlusIcon /> Add “{query.trim()}”
                        </button>
                    </div>
                )}

                {search && !visibleGroups.length && !canAdd && (
                    <p className="profile-chips__empty">No matches for “{query.trim()}”.</p>
                )}
            </div>
        </div>
    );
}

/* ==========================================================================
   Textarea with counter
   ========================================================================== */
function TextareaControl({ field, value, onChange, id, aria }) {
    const text = value ?? "";
    return (
        <>
            <textarea
                id={id}
                className="profile-textarea"
                value={text}
                rows={5}
                maxLength={field.maxLength}
                placeholder={field.placeholder || ""}
                onChange={(event) => onChange(event.target.value)}
                {...aria}
            />
            {field.maxLength && (
                <span className="profile-field__counter" aria-hidden="true">
                    {String(text).length}/{field.maxLength}
                </span>
            )}
        </>
    );
}

/* ==========================================================================
   Field shell: label, control, hint and inline error
   ========================================================================== */
const GROUP_TYPES = ["choice", "stepper", "multi-select"];
const WIDE_TYPES = ["textarea", "multi-select"];

export function ProfileField({ field, value, values, onChange, error }) {
    const id = useId();
    const labelId = `${id}-label`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const type = field.type || "text";
    const isGroup = GROUP_TYPES.includes(type);
    const hint = typeof field.hint === "function" ? field.hint(value, values) : field.hint;
    const describedBy = [error && errorId, hint && !error && hintId].filter(Boolean).join(" ") || undefined;

    const aria = {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": field.required || undefined,
    };
    const shared = { field, value, values, onChange, id, labelId, aria };

    const controls = {
        select: <SelectControl {...shared} />,
        choice: <ChoiceControl {...shared} />,
        stepper: <StepperControl {...shared} />,
        "multi-select": <MultiSelectControl {...shared} />,
        textarea: <TextareaControl {...shared} />,
    };

    const classes = [
        "profile-field",
        field.wide || WIDE_TYPES.includes(type) ? "profile-field--wide" : "",
        error ? "is-invalid" : "",
    ].filter(Boolean).join(" ");

    const labelContent = (
        <>
            {field.label}
            {field.required && <b aria-hidden="true"> *</b>}
        </>
    );

    return (
        <div className={classes} data-field={field.name}>
            {isGroup ? (
                <span id={labelId} className="profile-field__label">{labelContent}</span>
            ) : (
                <label htmlFor={id} className="profile-field__label">{labelContent}</label>
            )}

            {controls[type] ?? <TextControl {...shared} />}

            {hint && !error && <span id={hintId} className="profile-field__hint">{hint}</span>}
            {error && <span id={errorId} className="profile-field__error" role="alert">{error}</span>}
        </div>
    );
}
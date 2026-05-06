# ZikFash "Master's Cut" Animation Rig Guide

This document explains the mechanical rigging and CSS architecture behind the ZikFash landing page hero animation. It serves as a cheat sheet for refining the final "Z" logo lockup and maintaining the 3D slanted projection.

## 1. The Mechanical Architecture (The Unified Hinge)
The entire scissor animation is based on a **True Hinge Rig**. Instead of moving disconnected pieces around with arbitrary margins, both the Top Blade (`#top-part`) and Bottom Blade (`#bottom-part`) are anchored to the exact same rotational center—the physical screw.

*   **Hinge Coordinate:** `transform-origin: 155px 44px;`
*   **Why this matters:** When the scissors transition into the "Z" shape, they pivot mechanically around this exact point. All positioning math is relative to this screw.

## 2. Shaping the "Z"
If you want to alter the actual shape of the "Z" logo itself, adjust the internal parts.

### A. The Diagonal Line (Assembly A)
*   **Target CSS:** `#scissors.transformed #bottom-part`
*   **Property:** `transform: rotateZ(-60deg);`
*   **How to edit:** Change the degrees (e.g., `-50deg` for a flatter slant, `-70deg` for a steeper slant).

### B. The Bottom Bar
*   **Target CSS:** `#scissors.transformed #top-part`
*   **Property:** `transform: translate(-14px, 96px) rotateZ(540deg);`
*   **How to edit:** 
    *   **Change X (`-14px`):** Slide the bottom bar Left/Right.
    *   **Change Y (`96px`):** Slide the bottom bar Up/Down.

### C. The Top Bar
*   **Target CSS:** `#scissors.transformed #top-part .blade.segment-2`
*   **Property:** `transform: translate(-132px, 229px) rotateZ(-360deg);`
*   **How to edit:**
    *   **Inverted Logic:** Because the parent assembly flipped 180° upside down, the translation axes here are inverted globally.
    *   **Change X (`-132px`):** Closer to zero (e.g., `-100px`) moves RIGHT. More negative (e.g., `-160px`) moves LEFT.
    *   **Change Y (`229px`):** Smaller numbers move DOWN. Larger numbers move UP.

---

## 3. The Slanted Rig Projection & Flattening
As of the latest update, ZikFash uses a **Unified Slant Rig** that smoothly transitions to a flat state.

### A. Initial 3D View (The "Slant")
*   **Container:** `#logo-rig`
*   **Projection:** `transform: rotateX(55deg) rotateZ(-15deg);`
*   **Logic:** This creates the premium "cutting table" look. All child elements (fabric, scissors, text) share this perspective.

### B. Dynamic Flattening (The "Lockup")
*   **Trigger:** The `.transformed` class (applied via `script.js` at the end of the cut).
*   **Logic:** The rig flattens to `rotateX(0deg) rotateZ(0deg)` over 2 seconds.
*   **Why:** This removes perspective distortion for the final brand logo, ensuring the "Z" and text are perfectly aligned and readable.

---

## 4. Mechanical Math & Synchronization
The animation relies on a variable-driven math system to ensure perfect contact between the scissors and the fabric.

### A. The 310px Tip-Offset
The most critical constant in the rig is the **310px distance** from the `#scissors` origin to the physical tip of the blades.
*   **Math:** `Left Position = Fabric Edge - 310px`.
*   **Scaled (Mobile):** For `scale(0.6)`, the offset is `186px`.

### B. Variable-Driven Layout (`--fabric-w`)
We use CSS variables to sync all components:
*   `--fabric-w`: Defines the width of the fabric elements and the travel distance of the scissors.
*   `--rig-scale`: Adjusts the scissor size for mobile without breaking the math.

### C. Timing Synchronization
*   **Animation Delay:** A `2s` initial delay is applied to let the page settle.
*   **Snip Calibration:** Snip cycles (5 iterations) are calculated to end exactly at 90% of the movement duration:
    *   **Desktop:** 1.8s snips over 10s movement = Finish at 9s (Edge).
    *   **Mobile:** 1.44s snips over 8s movement = Finish at 7.2s (Edge).

---

## 5. Troubleshooting & Error Fixes
Documented solutions to common rig issues:

*   **Snap to Mid-Fabric:** Occurs if the `#cut` origin and `#scissors` 0% keyframe are not aligned using the 310px offset. Ensure the scissors start far enough left so the *tip* touches the edge.
*   **Backward Jump:** Caused by stale intermediate keyframes (10%, 30%, etc.) in `@keyframes move`. Always use a clean Start -> 90% -> 100% sequence for the parent movement.
*   **Cutting in Air:** Occurs if the snip cycles (`rotateTop/Bottom`) are longer than the time it takes to reach 90% of the movement. Recalculate snip duration to match `(Total Duration * 0.9) / 5`.
*   **Fabric/Cut Mismatch:** Occurs if `max-width` on fabric conflicts with `vw` units on the cut line. Always use the `--fabric-w` variable for both to ensure they grow and shrink together.

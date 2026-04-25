# ZikFash "Master's Cut" Animation Rig Guide

This document explains the mechanical rigging and CSS architecture behind the ZikFash landing page hero animation. It serves as a cheat sheet for refining the final "Z" logo lockup.

## 1. The Mechanical Architecture (The Unified Hinge)
The entire scissor animation is based on a **True Hinge Rig**. Instead of moving disconnected pieces around with arbitrary margins, both the Top Blade (`#top-part`) and Bottom Blade (`#bottom-part`) are anchored to the exact same rotational center—the physical screw.

*   **Hinge Coordinate:** `transform-origin: 155px 44px;`
*   **Why this matters:** When the scissors transition into the "Z" shape, they pivot mechanically around this exact point. All positioning math is relative to this screw.

## 2. Moving the Entire "Z" (Text Alignment)
To move the assembled "Z" relative to the "ikFash" typography, you adjust the parent container coordinates.

*   **Target CSS:** `#scissors.transformed` AND `@keyframes move { 100% { ... } }`
*   **Properties to change:**
    *   `left: calc(50% - 210px);` -> Decrease `210px` (e.g., `190px`) to move the Z to the **RIGHT**.
    *   `top: calc(50% - 80px);` -> Increase `80px` (e.g., `100px`) to move the Z **UP**.
*   **Crucial Step:** You **must** update these values in *both* `#scissors.transformed` and the `100%` keyframe of the `move` animation, otherwise the scissors will glitch at the end of their flight.

## 3. Shaping the "Z"
If you want to alter the actual shape of the "Z" logo itself, you will adjust the internal parts.

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
    *   *Note: The `540deg` creates the cinematic flip-and-roll. Do not remove it.*

### C. The Top Bar
*   **Target CSS:** `#scissors.transformed #top-part .blade.segment-2`
*   **Property:** `transform: translate(-132px, 229px) rotateZ(-360deg);`
*   **How to edit:**
    *   **Mindbender Warning:** Because the parent assembly flipped 180° upside down, the translation axes here are inverted globally!
    *   **Change X (`-132px`):** Making it *closer to zero* (e.g. `-100px`) moves the bar **RIGHT**. Making it *more negative* (e.g. `-160px`) moves it **LEFT**.
    *   **Change Y (`229px`):** Smaller numbers (e.g. `200px`) move the bar **DOWN**. Larger numbers move it **UP**.

## 4. Typographic "Pocket" (Fixing Text Overlaps)
The mechanical scissors "Z" is wider (~140px) than a standard font "Z" (~80px). To prevent the wide scissors from crashing into the "ik", we created a physical "pocket" in the HTML.

*   **How it works:** The original "Z" in the HTML is wrapped in `<span id="z-placeholder">Z</span>`.
*   **Target CSS:** `#z-placeholder`
*   **Property:** `width: 140px;`
*   **How to edit:** If you make the scissor Z even wider, it might hit the "ik". Simply increase `140px` to `160px` or more to push the "ik" further to the right.

## 5. Pro Debugging Tips

1.  **Flatten the 3D Perspective:** 
    If the isometric 45° tilt makes it hard to see if the bars are aligning correctly, temporarily change `rotateX(45deg)` to `rotateX(0deg)` in `#scissors.transformed`. This flattens the view so you can perfect the 2D "Z" shape before tilting it back into 3D.
2.  **Speed Up Testing:**
    Waiting 15 seconds to see the final logo transformation can be tedious while testing coordinates. Temporarily change the CSS `transition` durations to `0.5s` and lower the Javascript `setTimeout` delay from `10500` to `500` to see near-instant results.

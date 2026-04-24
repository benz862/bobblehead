# Workflow: BobbleMe Post-Purchase Video Upsell Funnel

**Description**: This workflow instructs the Antigravity Agent to autonomously plan, implement, and verify a high-converting, 3-tier post-purchase video upsell funnel for BobbleMe.app using the HeyGen API.

---

## 1. Context & Business Logic
**Goal:** We are building a Post-Purchase One-Click Upsell (OTO) funnel. Immediately after a customer successfully purchases their $7.99 3D Bobblehead image, they will be redirected to this upsell page before reaching the final confirmation/download screen.
**Target Audience:** B2B professionals (real estate agents, mortgage brokers).
**Core Value Prop:** Convert their static bobblehead into a 1-minute, animated, lip-syncing promotional video.

## 2. Product Tiers & Pricing State
The UI must support three distinct pricing tiers/add-ons. 

*   **Tier 1: The "Impulse Buy" Base Video ($39.99)**
    *   **Features:** 1-minute animated video, standard background (e.g., modern house), standard AI voice.
    *   **Form Requirement:** A `<textarea>` for the user to paste their exact script (max 150 words). Include a placeholder template.
*   **Tier 2: The "Premium Pro" Video ($69.99) - *Highlight as Most Popular***
    *   **Features:** Custom Background + Dynamic Captions + AI Scriptwriting Assistance.
    *   **Form Requirement:** 3 short text `<input>` fields for bullet points (we write the script for them via LLM) AND a file upload zone for their Custom Background (Property/Logo).
*   **Add-On: "Voice Clone" Order Bump (+$29.99)**
    *   **Features:** Video uses the customer's actual voice instead of an AI voice via HeyGen voice cloning.
    *   **Form Requirement:** A standalone checkbox/toggle. If checked, dynamically reveal an audio file upload zone (`.mp3`, `.m4a`, `.wav`).

## 3. Technical Architecture & UI
- **Styling:** Use the workspace's existing styling framework (e.g., Tailwind CSS). Design must be mobile-first and high-converting.
- **Layout:**
  - **Left Column:** Auto-playing, muted video player showing the example video. Headline: *"Wait! Turn your Bobblehead into a 24/7 Virtual Sales Rep."*
  - **Right Column:** Pricing cards (Tier 1 vs Tier 2) with active/inactive states. Voice Clone order bump checkbox below them.
  - **Footer:** A sticky dynamic Cart Total and a "Complete Upgrade" CTA button. Below the CTA, add a low-visibility text opt-out link: *"No thanks, I don't need a video right now. Take me to my $7.99 image."*
- **State Management:** Track the selected tier, uploaded files, script text/bullets, and dynamically calculate the subtotal.

---

## 4. Agent Task List (Execution Steps)
**@Agent:** Execute the following tasks sequentially. Generate required Artifacts at each stage. Do not proceed to the next step until the current one is completed.

- [ ] **Task 1: Codebase Analysis & Planning**
  - Analyze the existing checkout and routing flow.
  - Generate an **Implementation Plan Artifact** detailing the new frontend components, state structure, and the mocked API routes you will build to support the HeyGen payload.
  - *Pause and ask the user to approve the Implementation Plan before writing code.*

- [ ] **Task 2: Scaffold the Upsell UI & Components**
  - Build the two-column layout.
  - Embed the demo video player.
  - Build the selectable pricing cards (Tier 1 and Tier 2). Ensure mutual exclusivity (selecting one deselects the other).
  - Build the Voice Clone order bump toggle.

- [ ] **Task 3: Implement State Logic & Dynamic Forms**
  - Wire up the UI state based on the selected tier.
  - Conditionally render the script `<textarea>` for Tier 1.
  - Conditionally render the 3 bullet point inputs and image upload dropzone for Tier 2.
  - Conditionally render the audio file upload if the Voice Clone toggle is checked.
  - Calculate the dynamic subtotal for the CTA button based on active selections.

- [ ] **Task 4: Mock Backend API Routes**
  - Create mock server-side logic (e.g., `POST /api/heygen-upsell`) to accept the payload: `avatarUrl`, `tierSelected`, `scriptData`, `backgroundFile`, `voiceFile`.
  - Wire the CTA button to submit the payload, show a loading state, and safely route to a `/success` page.

- [ ] **Task 5: Verification & Browser Testing**
  - Start the local development server.
  - Spin up the **Browser Subagent**.
  - Navigate to the newly created upsell route on localhost.
  - Simulate a user selecting Tier 2, toggling the Voice Clone feature, and entering test data.
  - Generate a **Screenshot Artifact** of the populated UI and a **Browser Recording Artifact** of the form interaction.
  - Present the Artifacts to the user for final visual review.
# Project Plan: Scrambler Social

A user-centric platform for scrambler enthusiasts to showcase their custom builds.

## 1. Architecture
- **Frontend:** React (JavaScript)
- **Backend/Database:** Firebase (Authentication, Firestore, Storage)
- **Styling:** Vanilla CSS (Modern, rugged aesthetic)

## 2. Key Features
- **User Auth:** Login/Signup via Firebase Auth (Google and Email).
- **Global Feed:** Visual grid of custom scrambler builds from all users.
- **Build Details:** View a specific build with full-size images, description, and stats.
- **Social Actions:**
    - Like/Unlike a build.
    - Post and view comments on builds.
- **Upload Workflow:**
    - Image selection and preview.
    - Description and title input.
    - Automatic upload to Firebase Storage and metadata to Firestore.

## 3. Visual Design (Aesthetic)
- **Palette:** Dark mode by default. Deep charcoal (#121212), brushed metallic accents (#A0A0A0), and a "safety orange" or "vintage gold" for calls to action (#FF8C00).
- **Typography:** Bold sans-serif for headings (e.g., 'Inter', 'Roboto'), monospaced for technical details.
- **UI Elements:** Cards with subtle shadows, rugged border-radius (4px), and glassmorphism for overlays.

## 4. Implementation Steps
1. [x] **Initial Cleanup:** Remove boilerplate files from CRA.
2. [x] **Firebase Integration:** Initialize Firebase project and local configuration.
3. **Components Development:**
    - [x] `Navbar`: Brand logo and Auth buttons.
    - [x] `Feed`: Grid of `BuildCard` components.
    - [x] `UploadForm`: Modal/Page for new submissions.
    - [x] `BuildDetail`: Focused view for a single build with a permanent URL.
4. **Logic Implementation:**
    - [x] Auth state management (React Context).
    - [x] Firestore queries for fetching and posting data.
    - [x] Firebase Storage handling for image resizing/uploads.
    - [x] Client-side routing with `react-router-dom`.

5. [x] **Polishing:** CSS transitions, responsive grid, and empty states.
6. [x] **Mobile Optimization:**
    - [x] Responsive CSS media queries.
    - [x] Floating Action Button for uploads.
    - [x] App manifest and branding updates.

## 5. Next Steps
- [x] Initialize Firebase SDK.
- [x] Create the base CSS theme.
- [x] Implement Authentication context.
- [ ] Implement BuildDetail page for deeper interaction.

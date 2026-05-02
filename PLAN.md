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
1. **Initial Cleanup:** Remove boilerplate files from CRA.
2. **Firebase Integration:** Initialize Firebase project and local configuration.
3. **Components Development:**
    - `Navbar`: Brand logo and Auth buttons.
    - `Feed`: Grid of `BuildCard` components.
    - `UploadForm`: Modal/Page for new submissions.
    - `BuildDetail`: Expanded view for comments and likes.
4. **Logic Implementation:**
    - Auth state management (React Context).
    - Firestore queries for fetching and posting data.
    - Firebase Storage handling for image resizing/uploads.
5. **Polishing:** CSS transitions, responsive grid, and empty states.

## 5. Next Steps
- [ ] Initialize Firebase SDK.
- [ ] Create the base CSS theme.
- [ ] Implement Authentication context.

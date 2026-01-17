# Jigsaw Puzzle Royale 🧩

An interactive jigsaw puzzle game built with **React**, **TypeScript**, and **Vite**. Puzzle tiles are rendered on an HTML5 Canvas, providing a smooth gameplay experience with drag-and-drop, snapping, and special effects.

## ✨ Features

- **HTML5 Canvas Rendering:** Fast and efficient rendering even with many puzzle pieces.
- **Smart Snapping:** Pieces automatically snap into place when they are close enough to their target position.
- **Interactive Controls:** Support for drag-and-drop and tile rotation.
- **Visual Feedback:** Confetti effects and victory text upon successful completion.
- **Modern Tech Stack:** React 19, Zustand for state management, and TypeScript for type safety.
- **Responsive Design:** Optimized for various screen sizes (with zoom protection on mobile devices).

## 🚀 Tech Stack

- **Frontend:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Animations/Effects:** `react-confetti` & Custom Canvas Logic
- **Styling:** CSS3 (Modern Hooks & Flexbox)

## 🛠️ Installation & Development

### Prerequisites

Make sure you have **Node.js** and **Yarn** installed.

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/CWBudde/Jigsaw-React-App.git
   cd Jigsaw-React-App
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

### Build & Deployment

To create a production-ready version:
```bash
yarn build
```
The files will be generated in the `dist/` folder. You can test the build locally with `yarn preview`.

### GitHub Pages (Release Deployment)

This repo includes a GitHub Actions workflow that deploys `dist/` to **GitHub Pages** whenever a **GitHub Release** is published.

Live demo: https://cwbudde.github.io/jigsaw-react-app/

1. In your GitHub repo settings, enable **Pages** and set **Source** to **GitHub Actions**.
2. Publish a new release (GitHub UI → Releases → “Draft a new release”).
3. The workflow `Deploy to GitHub Pages` builds the app and deploys it.

## 📂 Project Structure

- `src/components/`: UI components (Canvas, overlays, effects).
- `src/hooks/`: Custom hooks for drag-and-drop, animations, and game logic.
- `src/lib/jigsaw/`: Core logic for puzzle generation and geometry.
- `src/store/`: Global state with Zustand.
- `public/`: Static assets like icons, fonts, and images.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Happy puzzling! 🧩✨

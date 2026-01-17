import { PuzzleCanvas } from '@components/PuzzleCanvas';
import { PuzzlePreview } from '@components/PuzzlePreview';
import { ConfettiEffect } from '@components/ConfettiEffect';
import { VictoryText } from '@components/VictoryText';
import { CompletionOverlay } from '@components/CompletionOverlay';
import './App.css';

function App() {
  return (
    <div className="app">
      <PuzzleCanvas />
      <PuzzlePreview />
      <ConfettiEffect />
      <VictoryText />
      <CompletionOverlay />
    </div>
  );
}

export default App;

import ChatList from './components/ChatList';
import Composer from './components/Composer';
import ControlBar from './components/ControlBar';
import StatsPanel from './components/StatsPanel';

export default function App() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="panel-glow mx-auto max-w-6xl rounded-[34px] p-2 shadow-glow">
        <div className="chat-shell flex h-[calc(100vh-6rem)] flex-col gap-6 p-6 md:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#3d4a4f]">High-Performance AI Chat</p>
              <h1 className="text-2xl font-semibold text-[#1b2a2f] md:text-3xl">
                Streaming responses without UI freezes
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#3d4a4f]">
                Windowed rendering, batched updates, and off-main-thread markdown parsing keep the
                interface responsive even with 5+ MB histories.
              </p>
            </div>
            <StatsPanel />
          </header>
          <ControlBar />
          <ChatList />
          <Composer />
        </div>
      </div>
    </div>
  );
}

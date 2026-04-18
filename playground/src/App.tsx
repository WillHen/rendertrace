import { useState } from "react";
import { useRenderLens } from "renderlens";

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  marginBottom: 16,
};

function Header({ title }: { title: string }) {
  const ref = useRenderLens("Header");
  return (
    <header ref={ref} style={{ ...card, fontSize: 22, fontWeight: 600 }}>
      {title}
    </header>
  );
}

function Counter() {
  const ref = useRenderLens("Counter");
  const [n, setN] = useState(0);
  return (
    <section ref={ref} style={card}>
      <div style={{ marginBottom: 12 }}>Count: {n}</div>
      <button
        type="button"
        onClick={() => setN(n + 1)}
        style={{ padding: "6px 12px" }}
      >
        bump
      </button>
    </section>
  );
}

function Row({ i, tick }: { i: number; tick: number }) {
  const ref = useRenderLens(`Row[${i}]`);
  return (
    <li
      ref={ref}
      style={{
        padding: "8px 12px",
        borderBottom: "1px solid #eee",
        listStyle: "none",
      }}
    >
      row {i} — parent tick {tick}
    </li>
  );
}

function List() {
  const ref = useRenderLens("List");
  const [tick, setTick] = useState(0);
  return (
    <section ref={ref} style={card}>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setTick(tick + 1)}
          style={{ padding: "6px 12px" }}
        >
          re-render list ({tick})
        </button>
      </div>
      <ul style={{ margin: 0, padding: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <Row key={i} i={i} tick={tick} />
        ))}
      </ul>
    </section>
  );
}

export function App() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto" }}>
      <Header title="RenderLens playground" />
      <Counter />
      <List />
    </main>
  );
}

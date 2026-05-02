import { connectDrive } from "../lib/bridge";

export function DriveConnectPanel() {
  async function onConnect() {
    const result = await connectDrive();
    console.log("connectDrive result", result);
  }

  return (
    <section className="card">
      <h2>Drive</h2>
      <p>No drive connected.</p>
      <button onClick={onConnect}>Connect Drive</button>
    </section>
  );
}

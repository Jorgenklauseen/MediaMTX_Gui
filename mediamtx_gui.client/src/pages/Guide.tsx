import { useState } from "react";
import "../styles/guide.css";

const streamSteps = [
  
  {
    number: 1,
    title: "Create a project and stream",
    description:
      'Open a current project or create a new one. Under the "Streams" section, type a name for the stream and click the "Create Stream" button to create it.',
    details: [
      "You become the project owner automatically. Only owners can delete the project.",
      "You can invite collaborators at any time, they'll receive the member role.",
      "Only the stream creator can regenerate the key, delete, or record their stream, regardless of role.",

    ],
    images: [
      { src: "/pictures/start_stream_0.png", alt: "Screenshot: Create project" },
      { src: "/pictures/start_stream_first.png", alt: "Screenshot: Add stream to project" },
    ],
  },
  {
    number: 2,
    title: "Copy the server URL and stream key",
    description:
      "After creating the stream, choose which protocol to publish with. The credentials you need depend on the protocol. RTMP is most used.",
    details: [
      "RTMP: both a server URL and a stream key are generated. You need both in OBS.",
      "SRT: only a server URL is generated — paste it directly into OBS. No stream key needed.",
      "Want to record the stream? Click the record button now, before opening OBS.",
    ],
    images: [
      { src: "/pictures/start_stream_11.png", alt: "Screenshot: Add stream to project" },

    ],
  },
  {
    number: 3,
    title: "Configure stream settings in OBS",
    description:
      'Open OBS Studio and go to File → Settings → Stream. Select "Custom" as the service, then paste the RTMP URL and stream key.',
    details: [
      'Click "Apply" and "OK" to save.',
    ],
    images: [
      { src: "/pictures/start_stream_1.png", alt: "Screenshot: RTMP URL and stream key" },
      { src: "/pictures/start_stream_2.png", alt: "Screenshot: Configure stream in OBS Studio" },
    ],
  },
  {
    number: 4,
    title: "Configure output for WebRTC",
    description:
      'To allow viewers to watch via WebRTC, go to File → Settings → Output and enable custom encoder settings.',
    details: [
      'Enable "Custom Encoder Settings (Advanced)".',
      'Enter "bframes=0" in the "Encoder Settings" field.',
      'Click "Apply" and "OK".',
    ],
    images: [
      { src: "/pictures/b_frames0.png", alt: "Screenshot: Set bframes=0 for WebRTC" },
    ],
  },
  {
    number: 5,
    title: "Start streaming from OBS",
    description:
      'Click "Start Streaming" in OBS. The stream will appear on the Dashboard and in the project. Finished recordings can be found under "Recordings" if recording was turned on.',
    details: [
      "The stream goes live as soon as OBS connects to the MediaMTX server.",
      'Recording is stopped by clicking "Stop recording" on the stream card in the project or when stopping the stream in OBS.',
    ],
    images: [
      { src: "/pictures/start_stream_3.png", alt: "Screenshot: Starting stream in OBS" },
      { src: "/pictures/start_stream_4.png", alt: "Screenshot: Stream live on Dashboard" },
    ],
  },
];

const viewSteps = [
  {
    number: 1,
    title: "Get the playback URL",
    description:
      'Open the stream in the project and click "Playback via" to reveal the playback URL. If you are not part of the project, ask the project owner to share the URL with you.',
    details: [
      'Click "Playback via" on the stream card to expand the playback URL options.',
      "Copy the URL — you will need it in the next step.",
    ],
    images: [
      { src: "/pictures/start_stream_11_get.png", alt: "Screenshot: Get playback URL" },
    ],
  },
  {
    number: 2,
    title: "Add a Media Source in OBS",
    description:
      'Open OBS Studio. In the "Sources" panel, click "+" and select "Media Source". Give it a name and click OK.',
    details: [
      'In the "Sources" panel at the bottom, click the "+" icon.',
      'Select "Media Source" from the list and give it a name.',
    ],
    images: [
      { src: "/pictures/get_stream_0.png", alt: "Screenshot: Add media source in OBS" },
    ],
  },
  {
    number: 3,
    title: "Open the source properties",
    description:
      'Right-click the media source you just created and select "Properties", or double-click it.',
    details: [
      'The source will appear in the "Sources" list after you click OK.',
      'Click "Properties" to open the configuration window.',
    ],
    images: [
      { src: "/pictures/get_stream_1.png", alt: 'Screenshot: Click on the media source and click on "Properties".' },
    ],
  },
  {
    number: 4,
    title: "Paste the playback URL",
    description:
      'In the properties window, uncheck "Local File", then paste the playback URL into the "Input" field and click OK.',
    details: [
      'Make sure "Local File" is unchecked.',
      'Paste the playback URL you copied in step 1 into the "Input" field.',
      'If "Mpgets appears in "Input format", just remove it.',
      'Click OK to confirm.',
    ],
    images: [
      { src: "/pictures/get_stream_2.png", alt: 'Screenshot: Paste playback URL into input field and click "OK".' },
    ],
  },
  {
    number: 5,
    title: "Stream appears in OBS",
    description:
      "Wait a moment for OBS to connect. The stream will load and appear as a source in your scene.",
    details: [
      "The stream may take a few seconds to start playing.",
      "You can now use it as any other source in OBS — resize, reposition, or layer it.",
    ],
    images: [
      { src: "/pictures/get_stream_3.png", alt: "Screenshot: Stream loaded in OBS." },
    ],
  },
];

type Tab = "stream" | "view";

function StepImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="guide-step-image-wrap">
      {failed ? (
        <div className="guide-step-image-placeholder" style={{ display: "flex" }}>
          <span>Screenshot coming soon</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="guide-step-image"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function StepList({ steps }: { steps: typeof streamSteps }) {
  return (
    <ol className="guide-steps">
      {steps.map((step) => (
        <li key={step.number} className="guide-step">
          <div className="guide-step-meta">
            <span className="guide-step-number">{step.number}</span>
            <div className="guide-step-connector" aria-hidden="true" />
          </div>
          <div className="guide-step-body">
            <h2 className="guide-step-title">{step.title}</h2>
            <p className="guide-step-description">{step.description}</p>
            <ul className="guide-step-details">
              {step.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
            <div className="guide-step-images">
              {step.images.map((img) => (
                <StepImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Guide() {
  const [tab, setTab] = useState<Tab>("stream");

  return (
    <section className="guide-page">
      <div className="guide-shell">
        <header className="guide-header">
          <div className="guide-header-copy">
            <p className="guide-eyebrow">Get started</p>
            <h1>User guide</h1>
          </div>
        </header>

        <div className="guide-tabs">
          <button
            className={`guide-tab${tab === "stream" ? " guide-tab--active" : ""}`}
            onClick={() => setTab("stream")}
          >
            Start stream
          </button>
          <button
            className={`guide-tab${tab === "view" ? " guide-tab--active" : ""}`}
            onClick={() => setTab("view")}
          >
            Get stream
          </button>
        </div>

        {tab === "stream" ? (
          <StepList steps={streamSteps} />
        ) : (
          <StepList steps={viewSteps} />
        )}
      </div>
    </section>
  );
}

export default Guide;

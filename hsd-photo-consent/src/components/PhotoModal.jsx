import { useState, useRef, useCallback } from "react";

export default function PhotoModal({ onAccept, onClose }) {
  const [mode, setMode] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const handleClose = () => {
    stopStream();
    onClose();
  };

  // Clicking "Upload a Photo" directly opens file picker
  const handleUploadClick = () => {
    setMode("upload");
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    setMode("camera");
    setPreview(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("Unable to access camera. Please allow camera permission or use file upload instead.");
      setMode(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = 132;
    canvas.height = 170;
    const ctx = canvas.getContext("2d");
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const targetRatio = 132 / 170;
    const videoRatio = vw / vh;
    let sx, sy, sw, sh;
    if (videoRatio > targetRatio) {
      sh = vh; sw = vh * targetRatio; sx = (vw - sw) / 2; sy = 0;
    } else {
      sw = vw; sh = vw / targetRatio; sx = 0; sy = (vh - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 132, 170);
    setPreview(canvas.toDataURL("image/jpeg", 0.95));
    stopStream();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      // If user cancels file picker and no preview yet, go back to menu
      if (!preview) setMode(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 132;
        canvas.height = 170;
        const ctx = canvas.getContext("2d");
        const targetRatio = 132 / 170;
        const iw = img.width, ih = img.height;
        const imageRatio = iw / ih;
        let sx, sy, sw, sh;
        if (imageRatio > targetRatio) {
          sh = ih; sw = ih * targetRatio; sx = (iw - sw) / 2; sy = 0;
        } else {
          sw = iw; sh = iw / targetRatio; sx = 0; sy = (ih - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 132, 170);
        setPreview(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">📷 Place a Photo</h3>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        {/* Hidden file input — always mounted */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Choice screen */}
        {!mode && (
          <div className="modal-options">
            <p className="modal-desc">Choose how you want to add the beneficiary photo:</p>
            <button className="option-btn" onClick={handleUploadClick}>
              <span className="option-icon">🖼️</span>
              <div>
                <span className="option-label">Upload a Photo</span>
                <span className="option-sub">Choose from your device</span>
              </div>
            </button>
            <button className="option-btn" onClick={startCamera}>
              <span className="option-icon">📸</span>
              <div>
                <span className="option-label">Take a Photo</span>
                <span className="option-sub">Use your camera</span>
              </div>
            </button>
          </div>
        )}

        {/* Camera screen */}
        {mode === "camera" && !preview && (
          <div className="modal-camera">
            <div className="video-frame">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="face-guide">
                <div className="face-oval"></div>
              </div>
            </div>
            <p className="modal-desc camera-tip">Position face within the guide. Look straight ahead.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={capturePhoto}>📸 Capture</button>
              <button className="btn btn-ghost" onClick={() => { stopStream(); setMode(null); }}>← Back</button>
            </div>
          </div>
        )}

        {/* Preview screen */}
        {preview && (
          <div className="modal-preview">
            <p className="modal-desc">Preview — 35mm × 45mm</p>
            <div className="preview-frame">
              <img src={preview} alt="Preview" className="preview-img" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-accent" onClick={() => onAccept(preview)}>
                ✔ Use This Photo
              </button>
              <button className="btn btn-ghost" onClick={() => { setPreview(null); setMode(null); }}>
                ← Retake / Change
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
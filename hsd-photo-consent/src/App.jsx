import { useState, useRef, useCallback } from "react";
import clarkLogo from "./assets/cdc-logo.png";
import yakapLogo from "./assets/yakap-logo.png";
import PhotoModal from "./components/PhotoModal";
import "./App.css";

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [photoScale, setPhotoScale] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);

  const handlePhotoAccepted = (dataUrl) => {
    setPhoto(dataUrl);
    setPhotoPosition({ x: 0, y: 0 });
    setPhotoScale(1);
    setShowModal(false);
  };

  const handleReset = () => {
    setPhoto(null);
    setPhotoPosition({ x: 0, y: 0 });
    setPhotoScale(1);
  };

  const handlePrint = () => window.print();

  const onMouseDown = (e) => {
    if (!photo) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: photoPosition.x,
      posY: photoPosition.y,
    };
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPhotoPosition({
        x: dragStart.current.posX + dx,
        y: dragStart.current.posY + dy,
      });
    },
    [isDragging]
  );

  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const onTouchStart = (e) => {
    if (!photo) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      posX: photoPosition.x,
      posY: photoPosition.y,
    };
  };

  const onTouchMove = (e) => {
    if (!isDragging || !dragStart.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.mouseX;
    const dy = touch.clientY - dragStart.current.mouseY;
    setPhotoPosition({
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    });
  };

  const PH_W = 132;
  const PH_H = 170;

  return (
    <div className="app-wrapper" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <header className="site-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">📋</div>
            <div>
              <h1 className="header-title">HSD Photo Consent System</h1>
              <p className="header-sub">PhilHealth YAKAP · Clark Development Corporation</p>
            </div>
          </div>
          <div className="action-buttons no-print">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <span>📷</span> Place a Photo
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <span>🔄</span> Reset
            </button>
            <button className="btn btn-accent" onClick={handlePrint}>
              <span>🖨️</span> Print
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="form-container">
          <FormCopy
            photo={photo}
            photoPosition={photoPosition}
            photoScale={photoScale}
            PH_W={PH_W}
            PH_H={PH_H}
            isDragging={isDragging}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />
          <div className="cut-line">
            <span className="scissors">✂</span>
            <div className="dashed-line"></div>
          </div>
          <FormCopy
            photo={photo}
            photoPosition={photoPosition}
            photoScale={photoScale}
            PH_W={PH_W}
            PH_H={PH_H}
            isDragging={isDragging}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />
        </div>

        {photo && (
          <div className="photo-hint no-print">
            <span>💡</span> Drag the photo to reposition · Use the slider to zoom
            <div className="zoom-control">
              <span>🔍</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={photoScale}
                onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                className="zoom-slider"
              />
              <span>{Math.round(photoScale * 100)}%</span>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <PhotoModal onAccept={handlePhotoAccepted} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function FormCopy({
  photo, photoPosition, photoScale,
  PH_W, PH_H, isDragging,
  onMouseDown, onTouchStart, onTouchMove, onTouchEnd,
}) {
  return (
    <div className="form-page">
      <div className="form-top-row">
        <div className="logos">
          <img src={clarkLogo} alt="Clark Development Corporation" className="logo-clark" />
          <img src={yakapLogo} alt="PhilHealth YAKAP" className="logo-yakap" />
        </div>
        <div
          className={`photo-placeholder ${isDragging ? "dragging" : ""}`}
          style={{ width: PH_W, height: PH_H }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {photo ? (
            <img
              src={photo}
              alt="Beneficiary"
              style={{
                width: `${PH_W * photoScale}px`,
                height: `${PH_H * photoScale}px`,
                objectFit: "cover",
                transform: `translate(${photoPosition.x}px, ${photoPosition.y}px)`,
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          ) : (
            <div className="photo-placeholder-inner">
              <div className="photo-icon">👤</div>
              <span>Photo Here</span>
              <span className="photo-size-hint">35mm × 45mm</span>
            </div>
          )}
        </div>
      </div>

      <h2 className="form-title">PHOTO CONSENT FORM</h2>

      <div className="form-body">
        {/* Line 1 */}
        <div className="form-row">
          <span className="text-normal">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I,</span>
          <span className="blank" style={{ width: "75mm" }}></span>
          <span className="text-normal">, with address</span>
          <span className="blank" style={{ width: "50mm" }}></span>
        </div>
        {/* Label row */}
        <div className="label-row">
          <span className="field-label" style={{ marginLeft: "32px" }}>Name of Yakap Beneficiary</span>
        </div>

        {/* Line 2 */}
        <div className="form-row">
          <span className="blank" style={{ width: "110mm" }}></span>
          <span className="text-normal">grant permission and give</span>
        </div>
        {/* Label row */}
        <div className="label-row">
          <span className="field-label">Address of Yakap Beneficiary</span>
        </div>

        {/* Line 3 + paragraph as one continuous block */}
          <p className="form-para">
            my consent to <strong>Clark Development Corporation - Clinical Laboratory</strong> for the use of my photo or picture as one of the requirements in the availment of Konsulta benefit.
          </p>
          <p className="form-para indent">
            By signing below, I hereby authorize my Konsulta facility to save my photo for postaudit monitoring purposes of PhilHealth.
          </p>
      </div>

      <div className="signature-row">
        <div className="sig-field">
          <div className="sig-line"></div>
          <span className="sig-label">Name of Yakap Beneficiary</span>
        </div>
        <div className="sig-field">
          <div className="sig-line"></div>
          <span className="sig-label">Signature</span>
        </div>
        <div className="sig-field">
          <div className="sig-line"></div>
          <span className="sig-label">Date</span>
        </div>
      </div>

      <p className="form-note">
        <strong>Note:</strong> The photograph should be colored and at least the size of 35mm width x 45mm height. It should have full face, front view and eyes open. Photo should present full head from top of hair to bottom of chin. The head should be in the center of the frame. There should be no distracting shadows on the face or background. The light should be even and balanced to avoid shadows on the face.
      </p>
    </div>
  );
}
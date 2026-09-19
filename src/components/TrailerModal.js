import Modal from './Modal';

export default function TrailerModal({ trailer, title, onClose }) {
  return (
    <Modal title={`${title}: trailer`} onClose={onClose} wide>
      <div className="trailer">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1&rel=0`}
          title={trailer.name || `${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      <p className="muted small">This video loads from YouTube once you press play.</p>
    </Modal>
  );
}

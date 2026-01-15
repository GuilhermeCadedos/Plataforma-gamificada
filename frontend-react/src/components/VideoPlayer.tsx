import React, { useRef, useState } from "react";

type VideoPlayerProps = {
  src: string;
  onVideoEnd: () => void;
};

const VideoPlayer = ({ src, onVideoEnd }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  const handleEnded = () => {
    setEnded(true);
    onVideoEnd();
  };

  return (
    <div className="mb-4">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full rounded shadow"
        onEnded={handleEnded}
        aria-label="Player de vídeo da aula"
      />
      {ended && (
        <div className="text-green-700 mt-2" role="status" aria-live="polite">
          Vídeo concluído! Quiz liberado.
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

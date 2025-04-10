import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageSrc = canvas.toDataURL("image/jpeg");
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="flex flex-col items-center">
                  <svg
                    className="animate-spin h-8 w-8 mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p>Iniciando câmera...</p>
                </div>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onCancel}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              onClick={captureImage}
              disabled={!isCameraReady}
              fullWidth
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              }
            >
              Capturar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Camera;

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useT } from '../contexts/I18nContext'

interface SelfieCameraProps {
  onCapture: (blob: Blob, previewUrl: string) => void
}

function squareCropToBlob(image: HTMLImageElement, mirror: boolean): Promise<{ blob: Blob; preview: string } | null> {
  const size = Math.min(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  const sx = (image.naturalWidth - size) / 2
  const sy = (image.naturalHeight - size) / 2
  if (mirror) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(image, sx, sy, size, size, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob ? { blob, preview: canvas.toDataURL('image/jpeg', 0.9) } : null)
      },
      'image/jpeg',
      0.9,
    )
  })
}

export default function SelfieCamera({ onCapture }: SelfieCameraProps) {
  const { t } = useT()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
      } catch {
        setCameraError(t('selfie.cameraError'))
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function capture() {
    const video = videoRef.current
    if (!video) return
    const size = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sx = (video.videoWidth - size) / 2
    const sy = (video.videoHeight - size) / 2
    // mirror horizontally so the preview matches what the user sees in a selfie
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCapture(blob, canvas.toDataURL('image/jpeg', 0.9))
      },
      'image/jpeg',
      0.9,
    )
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError(null)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      const result = await squareCropToBlob(img, false)
      URL.revokeObjectURL(url)
      if (result) {
        onCapture(result.blob, result.preview)
      } else {
        setUploadError(t('selfie.processError'))
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setUploadError(t('selfie.readError'))
    }
    img.src = url
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {cameraError ? (
        <p className="max-w-xs text-center text-sm text-app-muted">{cameraError}</p>
      ) : (
        <>
          <div className="relative aspect-square w-64 overflow-hidden rounded-full border-2 border-app-border bg-app-surface">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover [transform:scaleX(-1)]" />
          </div>
          <button
            type="button"
            onClick={capture}
            disabled={!ready}
            className="rounded-full bg-app-accent px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {t('selfie.takeSelfie')}
          </button>
        </>
      )}

      <div className="flex flex-col items-center gap-1.5">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-app-muted underline">
          {t('selfie.uploadInstead')}
        </button>
        {uploadError ? <p className="text-xs text-app-accent">{uploadError}</p> : null}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}

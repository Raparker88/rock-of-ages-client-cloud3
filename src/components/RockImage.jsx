import { useState, useEffect, useRef } from "react"
import { getRockImage } from "../services/rockImageService"

export const RockImage = ({ imageId }) => {
  const apiUrl = import.meta.env.VITE_API_URL
  const [image, setImage] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!imageId) return

    const poll = async () => {
      try {
        const data = await getRockImage(apiUrl, imageId)
        setImage(data)
        if (data.status !== "processing") {
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        clearInterval(intervalRef.current)
      }
    }

    poll() // run immediately
    intervalRef.current = setInterval(poll, 3000)

    return () => clearInterval(intervalRef.current)
  }, [imageId])

  if (!image) return null

  if (image.status === "processing") {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Processing image…
      </div>
    )
  }

  return (
    <>
      {/* Thumbnail */}
      <img
        src={image.thumbnail_small_url}
        alt="Rock thumbnail"
        onClick={() => setShowOriginal(true)}
        className="mt-2 h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
        title="Click to view full image"
      />

      {/* Original image modal */}
      {showOriginal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowOriginal(false)}
        >
          <div className="relative max-w-3xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowOriginal(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center text-lg"
            >
              ✕
            </button>
            <img
              src={image.original_url}
              alt="Rock full size"
              className="max-h-screen max-w-full rounded-md"
            />
          </div>
        </div>
      )}
    </>
  )
}
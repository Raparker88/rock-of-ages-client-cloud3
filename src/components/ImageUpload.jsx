import { useState } from "react"
import { getPresignedUrl, uploadToS3 } from "../services/rockImageService"

export const ImageUpload = ({ rockId, onUploadComplete }) => {
  const apiUrl = import.meta.env.VITE_API_URL
  const [status, setStatus] = useState("idle") // idle | requesting | uploading | error
  const [error, setError] = useState("")

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    console.log("file.name:", file.name)
    console.log("file.type:", file.type)

    try {
      setStatus("requesting")
      setError("")

      // Step 1: get pre-signed URL from API
      const { presigned_url, image_id } = await getPresignedUrl(
        apiUrl,
        rockId,
        file.name,
        file.type
      )

      // Step 2: PUT file directly to S3
      setStatus("uploading")
      await uploadToS3(presigned_url, file)

      setStatus("idle")
      onUploadComplete(image_id)
    } catch (err) {
      setStatus("error")
      setError(err.message)
    }
  }

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {status === "idle" && "Add an image"}
        {status === "requesting" && "Preparing upload…"}
        {status === "uploading" && "Uploading…"}
        {status === "error" && `Error: ${error}`}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={status === "requesting" || status === "uploading"}
        className="text-sm"
      />
    </div>
  )
}
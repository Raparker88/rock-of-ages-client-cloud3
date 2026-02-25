const getToken = () => JSON.parse(localStorage.getItem("rock_token")).token

export const getPresignedUrl = async (apiUrl, rockId, fileName, fileType) => {
  const res = await fetch(`${apiUrl}/rock-images/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${getToken()}`,
    },
    body: JSON.stringify({ rock_id: rockId, file_name: fileName, file_type: fileType }),
  })
  if (!res.ok) throw new Error(`Failed to get upload URL: ${res.status}`)
  return res.json() // { presigned_url, file_key, image_id, expires_in }
}

export const uploadToS3 = async (presignedUrl, file) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`)
}

export const getRockImage = async (apiUrl, imageId) => {
  const res = await fetch(`${apiUrl}/rock-images/${imageId}`, {
    headers: { Authorization: `Token ${getToken()}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  return res.json() // { id, rock, original_url, thumbnail_small_url, status, ... }
}
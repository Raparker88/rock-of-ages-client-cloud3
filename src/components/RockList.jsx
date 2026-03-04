import { useEffect, useState } from "react"
import { ImageUpload } from "./ImageUpload"
import { RockImage } from "./RockImage"

const RockCard = ({ rock, showAll, fetchRocks }) => {
  const apiUrl = import.meta.env.VITE_API_URL

  // Grab the first image from the array the API already returns
  const firstImage = rock.images?.[0] ?? null

  return (
    <div className="border p-5 border-solid rounded-md border-violet-900 mt-5 bg-slate-50">
      <div>
        {rock.name} ({rock.type.label})
      </div>
      <div>
        In the collection of {rock.user.first_name} {rock.user.last_name}
      </div>

      {/* Image section */}
      {firstImage ? (
        firstImage.status === "processing" ? (
          <p className="text-sm text-gray-500 mt-2">Processing...</p>
        ) : (
          <RockImage imageId={firstImage.id} />
        )
      ) : (
        !showAll && (
          <ImageUpload
            rockId={rock.id}
            onUploadComplete={() => fetchRocks(showAll)}
          />
        )
      )}

      {/* Delete button — My Rocks only */}
      {!showAll && (
        <div className="mt-2">
          <button
            onClick={async () => {
              const response = await fetch(`${apiUrl}/rocks/${rock.id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Token ${
                    JSON.parse(localStorage.getItem("rock_token")).token
                  }`,
                },
              })
              if (response.status === 204) {
                fetchRocks(showAll)
              }
            }}
            className="border border-solid bg-red-700 text-white p-1"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export const RockList = ({ rocks, fetchRocks, showAll }) => {
  useEffect(() => {
    fetchRocks(showAll)
  }, [showAll])

  const displayRocks = () => {
    if (rocks && rocks.length) {
      return rocks.map((rock) => (
        <RockCard
          key={`key-${rock.id}`}
          rock={rock}
          showAll={showAll}
          fetchRocks={fetchRocks}
        />
      ))
    }

    return <h3>Loading Rocks...</h3>
  }

  return (
    <>
      <h1 className="text-3xl">Rock List</h1>
      {displayRocks()}
    </>
  )
}

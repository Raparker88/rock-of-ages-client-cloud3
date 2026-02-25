import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ImageUpload } from "./ImageUpload"

export const RockForm = ({ fetchRocks }) => {
  const apiUrl = import.meta.env.VITE_API_URL
  const initialRockState = {
    name: "",
    weight: 0,
    typeId: 0,
  }

  const [types, changeTypes] = useState([
    { id: 1, label: "Igneous" },
    { id: 2, label: "Volcanic" },
  ])
  const [rock, updateRockProps] = useState(initialRockState)
  const [newRockId, setNewRockId] = useState(null)
  const navigate = useNavigate()

  const fetchTypes = async () => {
    const response = await fetch(`${apiUrl}/types`, {
      headers: {
        Authorization: `Token ${
          JSON.parse(localStorage.getItem("rock_token")).token
        }`,
      },
    })
    const types = await response.json()
    changeTypes(types)
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const collectRock = async (evt) => {
    evt.preventDefault()

    const response = await fetch(`${apiUrl}/rocks`, {
      method: "POST",
      headers: {
        Authorization: `Token ${
          JSON.parse(localStorage.getItem("rock_token")).token
        }`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rock),
    })

    const created = await response.json()
    setNewRockId(created.id)
  }

  const finishAndNavigate = async () => {
    await fetchRocks()
    navigate("/allrocks")
  }

  return (
    <main className="container--login">
      <section>
        <form className="form--login" onSubmit={() => {}}>
          <h1 className="text-3xl">Collect a Rock</h1>
          <fieldset className="mt-4">
            <label htmlFor="rock">Name:</label>
            <input
              id="rock"
              type="text"
              onChange={(e) => {
                const copy = { ...rock }
                copy.name = e.target.value
                updateRockProps(copy)
              }}
              value={rock.name}
              className="form-control"
            />
          </fieldset>
          <fieldset className="mt-4">
            <label htmlFor="weight">Weight in kg:</label>
            <input
              id="weight"
              type="number"
              onChange={(e) => {
                const copy = { ...rock }
                copy.weight = e.target.value
                updateRockProps(copy)
              }}
              value={rock.weight}
              className="form-control"
            />
          </fieldset>
          <fieldset className="mt-4">
            <label htmlFor="type"> Type </label>
            <br />
            <select
              id="type"
              className="form-control"
              onChange={(e) => {
                const copy = { ...rock }
                copy.typeId = parseInt(e.target.value)
                updateRockProps(copy)
              }}
            >
              <option value={0}>- Select a type -</option>
              {types.map((t) => (
                <option key={`type-${t.id}`} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </fieldset>

          {!newRockId && (
            <fieldset>
              <button
                type="submit"
                onClick={collectRock}
                className="button rounded-md bg-blue-700 text-blue-100 p-3 mt-4"
              >
                Collect Rock
              </button>
            </fieldset>
          )}

          {newRockId && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">
                Rock saved! Add an image (optional):
              </p>
              <ImageUpload
                rockId={newRockId}
                onUploadComplete={finishAndNavigate}
              />
              <button
                type="button"
                onClick={finishAndNavigate}
                className="mt-3 text-sm text-gray-500 underline"
              >
                Skip, I'll add an image later
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  )
}

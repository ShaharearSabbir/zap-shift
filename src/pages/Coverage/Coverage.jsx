import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLoaderData } from "react-router";

// Fix Leaflet marker icon for React
// This ensures that the default marker icons are correctly loaded from a CDN.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ZoomToMarker component handles the map's view change.
// It uses the `useMap` hook to get access to the Leaflet map instance
// and then uses `map.flyTo` to smoothly animate the map to the new position.
function ZoomToMarker({ position }) {
  const map = useMap(); // Get the Leaflet map instance

  // useEffect hook to react to changes in the 'position' prop.
  // When 'position' changes (i.e., a new search result is found),
  // the map will fly to that new location.
  useEffect(() => {
    if (position) {
      // Fly to the new position with a zoom level of 11 and a smooth animation duration.
      map.flyTo(position, 11, { duration: 1.5 });
    }
  }, [position, map]); // Dependencies: position and map instance

  return null; // This component doesn't render any visible elements directly.
}

// Main Coverage component displays the map and search functionality.
const Coverage = () => {
  const warehouses = useLoaderData();
  //   const [warehouses, setWarehouses] = useState([]);
  //   useEffect(() => {
  //     fetch("/warehouses.json")
  //       .then((res) => res.json())
  //       .then((data) => setWarehouses(data));
  //   }, []);

  // State to hold the current search term entered by the user.
  const [searchTerm, setSearchTerm] = useState("");
  // State to hold the latitude and longitude for zooming the map.
  // It's initialized to null, meaning no specific zoom target initially.
  const [zoomPosition, setZoomPosition] = useState(null);

  // useEffect hook to perform the search whenever the 'searchTerm' changes.
  // This makes the search "automatic" as the user types.
  useEffect(() => {
    // If the search term is empty, reset the zoom position.
    if (searchTerm.trim() === "") {
      setZoomPosition(null);
      return;
    }

    // Find the first warehouse that matches the search term (case-insensitive).
    // It searches within the 'district' field.
    const match = warehouses.find((w) =>
      w.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If a match is found, update the zoom position with its coordinates.
    // Otherwise, set zoomPosition to null.
    if (match) {
      setZoomPosition([match.latitude, match.longitude]);
    } else {
      setZoomPosition(null); // No match, so no specific zoom target.
    }
  }, [searchTerm]); // Dependency: searchTerm. This effect runs whenever searchTerm changes.

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 rounded-xl shadow-lg">
      <h2 className="text-4xl font-extrabold mb-6 text-center">
        We are available in 64 districts
      </h2>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search a district (e.g., Dhaka, Jessore)"
          className="input input-bordered w-full max-w-md p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on every input change
        />
      </div>

      <h3 className="text-xl font-semibold mb-6 text-center">
        We deliver almost all over Bangladesh
      </h3>

      {/* Map container with a fixed height and full width */}
      <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-300 shadow-md">
        <MapContainer
          center={[23.685, 90.3563]} // Initial center of the map (approx. center of Bangladesh)
          zoom={7} // Initial zoom level
          scrollWheelZoom={true} // Allow zooming with scroll wheel
          className="h-full w-full" // Ensure map takes full height and width of its container
        >
          {/* TileLayer for displaying the map tiles from OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />

          {/* Render ZoomToMarker component if zoomPosition is set */}
          {zoomPosition && <ZoomToMarker position={zoomPosition} />}

          {/* Iterate over the warehouses data to create markers on the map */}
          {warehouses.map((w, i) => (
            <Marker key={i} position={[w.latitude, w.longitude]}>
              {/* Popup displays detailed information when a marker is clicked */}
              <Popup>
                <div className="font-bold text-lg">{w.city}</div>
                <div>
                  <span className="font-medium">District:</span> {w.district}
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">Covered Areas:</span>{" "}
                  {w.covered_area.join(", ")}
                </div>
                {/* Link to the flowchart, opens in a new tab */}
                <a
                  href={w.flowchart}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 transition duration-200 ease-in-out font-semibold"
                >
                  View Flowchart
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Coverage;

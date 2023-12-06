import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiem1vcmVub293IiwiYSI6ImNscHQ1NmZ6MDA4bHEyam9iZnduaWZvNzcifQ.nkn0U0F5JK8g3-QpKoIe9w";

    // Solicitar datos al servidor
    fetch("http://localhost:5000/obtener-localidades")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data);
      })
      .catch((error) => {
        console.error("Error al obtener localidades:", error);
      });
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-72.589, -38.741], // Coordenadas centradas en Chile
      zoom: 13.5, // Nivel de zoom para mostrar todo Chile
    });

    map.on("contextmenu", (e) => {
      e.preventDefault();

      const { lng, lat } = e.lngLat;

      const locationName = window.prompt("¿Cómo se llama la localidad?");

      if (locationName) {
        // Guardar en la base de datos
        fetch("http://localhost:5000/guardar-localidad", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: lat,
            lng: lng,
            nombre: locationName,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success && data.newLocation) {
              // Actualizar las localidades localmente inmediatamente después de guardar en la base de datos
              setLocations((prevLocations) => [
                ...prevLocations,
                {
                  ID: data.newLocation.ID,
                  Latitud: data.newLocation.Latitud,
                  Longitud: data.newLocation.Longitud,
                  Nombre: data.newLocation.Nombre,
                },
              ]);

              setMessage("Localidad guardada exitosamente");

              // Llamar a la función para actualizar los marcadores del mapa
              updateMapMarkers();
            } else {
              setMessage("Error al guardar la localidad en la base de datos");
            }
            console.log(data.message);
          })
          .catch((error) => {
            setMessage("Error al guardar la localidad en la base de datos");
            console.error(
              "Error al guardar localidad en la base de datos:",
              error
            );
          });
      }
    });

    // Llamar a la función para inicializar los marcadores del mapa
    updateMapMarkers();
  }, [locations]);

  const handleDeleteLocation = (locationID) => {
    // Realizar la eliminación en la base de datos
    fetch(`http://localhost:5000/borrar-localidad/${locationID}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Actualizar las localidades después de la eliminación en la base de datos
          setLocations((prevLocations) =>
            prevLocations.filter((location) => location.ID !== locationID)
          );

          setMessage("Localidad eliminada exitosamente");

          // Llamar a la función para actualizar los marcadores del mapa
          updateMapMarkers();
        } else {
          setMessage("Error al eliminar la localidad");
        }
        console.log(data.message);
      })
      .catch((error) => {
        setMessage("Error al eliminar la localidad");
        console.error("Error al eliminar localidad:", error);
      });
  };

  const updateMapMarkers = () => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-72.589, -38.741],
      zoom: 13.5, // Nivel de zoom para mostrar todo Chile
    });

    map.on("contextmenu", (e) => {
      e.preventDefault();

      const { lng, lat } = e.lngLat;

      const locationName = window.prompt("¿Cómo se llama la localidad?");

      if (locationName) {
        // Guardar en la base de datos
        fetch("http://localhost:5000/guardar-localidad", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: lat,
            lng: lng,
            nombre: locationName,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success && data.newLocation) {
              // Actualizar las localidades después de guardar en la base de datos
              setLocations((prevLocations) => [
                ...prevLocations,
                {
                  ID: data.newLocation.ID,
                  Latitud: data.newLocation.Latitud,
                  Longitud: data.newLocation.Longitud,
                  Nombre: data.newLocation.Nombre,
                },
              ]);

              setMessage("Localidad guardada exitosamente");
            } else {
              setMessage("Error al guardar la localidad en la base de datos");
            }
            console.log(data.message);
          })
          .catch((error) => {
            setMessage("Error al guardar la localidad en la base de datos");
            console.error(
              "Error al guardar localidad en la base de datos:",
              error
            );
          });
      }
    });

    locations.forEach((location) => {
      new mapboxgl.Marker()
        .setLngLat([location.Longitud, location.Latitud])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.Nombre}</h3>`))
        .addTo(map);
    });
  };

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "400px" }}></div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Latitud</th>
            <th>Longitud</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.ID}>
              <td>{location.ID}</td>
              <td>{location.Latitud}</td>
              <td>{location.Longitud}</td>
              <td>{location.Nombre}</td>
              <td>
                <button onClick={() => handleDeleteLocation(location.ID)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MapView;

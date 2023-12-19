import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext";

const EncargadoQRCupones = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [cuponesData, setCuponesData] = useState([]);

  useEffect(() => {
    const isAuthenticated = checkAuthentication();
    if (!isAuthenticated) {
      navigate("/");
    } else {
      window.history.pushState(null, "", "/EncargadoQRCupones");
      // Obtener datos de la tabla "cuponesenl" desde el servidor
      fetch("http://localhost:5000/obtener-cupones", {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => setCuponesData(data))
        .catch((error) => console.error("Error al obtener datos:", error));
    }
  }, [navigate]);

  const checkAuthentication = () => {
    const jwtCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("jwt="));
    return jwtCookie !== undefined;
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });

      logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const enviarCuponAMapViews = (cuponID) => {
    // Envia la solicitud al servidor para mover el cupón de "cuponesenl" a "mapviews"
    fetch(`http://localhost:5000/enviar-cupon/${cuponID}`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Actualiza la lista de cupones después de enviar uno a "mapviews"
          fetch("http://localhost:5000/obtener-cupones", {
            method: "GET",
            credentials: "include",
          })
            .then((response) => response.json())
            .then((cuponesActualizados) => setCuponesData(cuponesActualizados))
            .catch((error) =>
              console.error("Error al obtener datos actualizados:", error)
            );
        } else {
          console.error("Error al enviar el cupón a mapviews:", data.message);
        }
      })
      .catch((error) =>
        console.error("Error al enviar el cupón a mapviews:", error)
      );
  };

  return (
    <div>
      <br />
      <center>
        <h2>Cupones</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Detalle</th>
              <th>Duracion</th>
              <th>Ver</th>
              <th>Enviar a MapViews</th>
            </tr>
          </thead>
          <tbody>
            {cuponesData.map((cupon) => (
              <tr key={cupon.ID}>
                <td>{cupon.ID}</td>
                <td>{cupon.Nombre}</td>
                <td>{cupon.Detalle}</td>
                <td>{cupon.Duracion}</td>
                <td>
                  {cupon.QrCode && (
                    <img
                      src={cupon.QrCode}
                      alt={`Código QR para ${cupon.Nombre}`}
                      style={{ width: "70px", height: "70px" }}
                    />
                  )}
                </td>
                <td>
                  <button onClick={() => enviarCuponAMapViews(cupon.ID)}>
                    Enviar a MapViews
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </center>
    </div>
  );
};

export default EncargadoQRCupones;

document.addEventListener("DOMContentLoaded", function() {
    let parametros = new URLSearchParams(window.location.search);
    let id = parseInt(parametros.get("id"));

    if (isNaN(id)) {
        mostrarError("ID no válido");
        return;
    }

    let catalogo = JSON.parse(localStorage.getItem("catalogo"));
    if (!catalogo) {
        mostrarError("No hay catálogo");
        return;
    }

    let producto = catalogo.find(p => p.id === id);
    if (!producto) {
        mostrarError("Producto no encontrado");
        return;
    }

    document.querySelector(".detalle-nombre").textContent = producto.nombre;
    document.querySelector(".detalle-categoria").textContent = producto.categoria;
    document.querySelector(".detalle-precio").textContent = producto.precio.toFixed(2);
    document.querySelector(".detalle-stock").textContent = producto.stock;
    document.querySelector(".detalle-descripcion").textContent = producto.descripcion;
});

function mostrarError(mensaje) {
    let body = document.getElementById("detalleBody");
    while (body.firstChild) body.removeChild(body.firstChild);
    let alerta = document.createElement("div");
    alerta.className = "alert alert-danger text-center";
    let texto = document.createTextNode(mensaje);
    let enlace = document.createElement("a");
    enlace.href = "index.html";
    enlace.className = "btn btn-primary mt-3";
    enlace.textContent = "Volver al catálogo";
    alerta.appendChild(texto);
    alerta.appendChild(document.createElement("br"));
    alerta.appendChild(enlace);
    body.appendChild(alerta);
}
document.addEventListener("DOMContentLoaded", main);

let productos = JSON.parse(localStorage.getItem("catalogo"));

function main() {
    cargarDetalle();
}

function cargarDetalle() {
    if (!productos || productos.length === 0) {
        window.location.href = "index.html";
        return;
    }

    let parametros = new URLSearchParams(window.location.search);
    let id         = parseInt(parametros.get("id"));
    let producto   = productos.find(p => p.id === id);

    if (!producto) {
        document.getElementById("cardDetalle").classList.add("d-none");
        document.getElementById("mensajeError").classList.remove("d-none");
        return;
    }

    document.querySelector(".card-img-top").src         = "img/" + producto.img;
    document.querySelector(".card-img-top").alt         = producto.nombre;
    document.querySelector(".card-title").textContent   = producto.nombre;
    document.querySelector(".card-text").textContent    = producto.descripcion;

    let spans = document.querySelectorAll(".list-group-item span");
    spans[0].textContent = producto.categoria;
    spans[1].textContent = producto.precio + " €";
    spans[2].textContent = producto.stock + " uds.";
}
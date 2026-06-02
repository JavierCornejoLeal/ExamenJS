document.addEventListener("DOMContentLoaded", function() {
    const parametrosURL = new URLSearchParams(window.location.search);
    const idProducto = parseInt(parametrosURL.get("id"));

    if (isNaN(idProducto)) {
        mostrarMensajeError("ID de producto no válido.");
        return;
    }

    const catalogo = JSON.parse(localStorage.getItem("catalogo"));
    if (!catalogo) {
        mostrarMensajeError("No hay catálogo disponible.");
        return;
    }

    const producto = catalogo.find(p => p.id === idProducto);
    if (!producto) {
        mostrarMensajeError(`Producto con ID ${idProducto} no encontrado.`);
        return;
    }

    // Mostrar los datos en el contenedor (sin innerHTML)
    const contenedor = document.getElementById("contenedorDetalle");
    // Vaciar contenedor
    while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);

    // Crear elementos de forma segura
    const listaDatos = document.createElement("ul");
    listaDatos.className = "list-group";

    const items = [
        { etiqueta: "ID", valor: producto.id },
        { etiqueta: "Nombre", valor: producto.nombre },
        { etiqueta: "Categoría", valor: producto.categoria },
        { etiqueta: "Precio", valor: producto.precio.toFixed(2) + " €" },
        { etiqueta: "Stock", valor: producto.stock },
        { etiqueta: "Descripción", valor: producto.descripcion }
    ];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const elementoLista = document.createElement("li");
        elementoLista.className = "list-group-item";
        elementoLista.innerHTML = `<strong>${item.etiqueta}:</strong> ${item.valor}`;
        listaDatos.appendChild(elementoLista);
    }

    contenedor.appendChild(listaDatos);
});

function mostrarMensajeError(mensaje) {
    const contenedor = document.getElementById("contenedorDetalle");
    while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);
    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger text-center";
    const texto = document.createTextNode(mensaje);
    const enlace = document.createElement("a");
    enlace.href = "index.html";
    enlace.className = "btn btn-primary mt-3";
    enlace.textContent = "Volver al catálogo";
    alerta.appendChild(texto);
    alerta.appendChild(document.createElement("br"));
    alerta.appendChild(enlace);
    contenedor.appendChild(alerta);
}
document.addEventListener("DOMContentLoaded", main);

let catalogo = [];
let mostrados = [];
let ordenActual = "default";
let editandoId = null;
let opcionesAutocomplete = [];   // Array para el autocomplete

async function main() {
    await cargarDatos();
    cargarCategoriasFiltro();
    filtrarYOrdenar();

    // === Autocomplete igual que en sript.js ===
    // Recorrer catálogo para obtener nombres de producto y categorías
    opcionesAutocomplete = [];
    catalogo.forEach(prod => {
        if (!opcionesAutocomplete.includes(prod.nombre)) opcionesAutocomplete.push(prod.nombre);
        if (!opcionesAutocomplete.includes(prod.categoria)) opcionesAutocomplete.push(prod.categoria);
    });
    $("#buscar").autocomplete({
        source: opcionesAutocomplete
    });

    // Eventos del formulario (igual que reserva.js)
    let formulario = document.getElementById("formulario-producto");
    document.getElementById("enviar").addEventListener("click", validar, false);
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();
        procesarFormulario();
    });
    document.getElementById("cancelEditBtn").addEventListener("click", cancelarEdicion);

    // Eventos de búsqueda y ordenación
    document.getElementById("buscar").addEventListener("input", () => filtrarYOrdenar());
    document.getElementById("filtroCategoria").addEventListener("change", () => filtrarYOrdenar());
    document.getElementById("ordenDefault").addEventListener("click", () => { ordenActual = "default"; filtrarYOrdenar(); });
    document.getElementById("ordenAsc").addEventListener("click", () => { ordenActual = "asc"; filtrarYOrdenar(); });
    document.getElementById("ordenDesc").addEventListener("click", () => { ordenActual = "desc"; filtrarYOrdenar(); });
}

// --- El resto de funciones (cargarDatos, guardarStorage, cargarCategoriasFiltro, filtrarYOrdenar, pintarProductos, cargarParaEditar, cancelarEdicion, procesarFormulario, eliminarProducto, validaciones, error, esborrarError) son EXACTAMENTE IGUALES que en la solución anterior ---

// A continuación se copian igual que antes, sin cambios.
// Para ahorrar espacio, pondré los mismos bloques que ya entregué.

async function cargarDatos() {
    let almacenados = JSON.parse(localStorage.getItem("catalogo"));
    if (almacenados && almacenados.length > 0) {
        catalogo = almacenados;
        return;
    }
    let resp = await fetch("productos.json");
    let json = await resp.json();
    catalogo = json;
    localStorage.setItem("catalogo", JSON.stringify(catalogo));
}

function guardarStorage() {
    localStorage.setItem("catalogo", JSON.stringify(catalogo));
}

function cargarCategoriasFiltro() {
    let select = document.getElementById("filtroCategoria");
    let cats = [];
    catalogo.forEach(p => { if (!cats.includes(p.categoria)) cats.push(p.categoria); });
    cats.forEach(c => {
        let opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

function filtrarYOrdenar() {
    let texto = document.getElementById("buscar").value.toLowerCase();
    let categoria = document.getElementById("filtroCategoria").value;
    let filtrados = catalogo.filter(p => {
        let coincideTexto = p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto);
        let coincideCat = (categoria === "all") || p.categoria === categoria;
        return coincideTexto && coincideCat;
    });
    if (ordenActual === "asc") filtrados.sort((a,b) => a.precio - b.precio);
    else if (ordenActual === "desc") filtrados.sort((a,b) => b.precio - a.precio);
    else filtrados.sort((a,b) => a.id - b.id);
    mostrados = filtrados;
    pintarProductos();
}

function pintarProductos() {
    let contenedor = document.getElementById("listado");
    while (contenedor.firstChild) contenedor.removeChild(contenedor.firstChild);
    if (mostrados.length === 0) {
        let aviso = document.createElement("p");
        aviso.textContent = "No hay productos";
        contenedor.appendChild(aviso);
        return;
    }
    mostrados.forEach(prod => {
        let col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";
        let card = document.createElement("div");
        card.className = "card h-100";
        let img = document.createElement("img");
        img.className = "card-img-top";
        img.src = "img/" + prod.img;
        img.alt = prod.nombre;
        let body = document.createElement("div");
        body.className = "card-body";
        let titulo = document.createElement("h5");
        titulo.textContent = prod.nombre;
        let categoria = document.createElement("p");
        categoria.textContent = prod.categoria;
        let precio = document.createElement("p");
        precio.className = "fw-bold";
        precio.textContent = prod.precio.toFixed(2) + " €";
        let stock = document.createElement("p");
        stock.textContent = "Stock: " + prod.stock;
        let btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn btn-sm btn-warning me-2";
        btnEditar.addEventListener("click", () => cargarParaEditar(prod.id));
        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "btn btn-sm btn-danger me-2";
        btnEliminar.addEventListener("click", () => eliminarProducto(prod.id));
        let btnDetalle = document.createElement("a");
        btnDetalle.textContent = "Ver detalle";
        btnDetalle.className = "btn btn-sm btn-info";
        btnDetalle.href = "detalle.html?id=" + prod.id;
        body.appendChild(titulo);
        body.appendChild(categoria);
        body.appendChild(precio);
        body.appendChild(stock);
        body.appendChild(btnEditar);
        body.appendChild(btnEliminar);
        body.appendChild(btnDetalle);
        card.appendChild(img);
        card.appendChild(body);
        col.appendChild(card);
        contenedor.appendChild(col);
    });
}

function cargarParaEditar(id) {
    let prod = catalogo.find(p => p.id === id);
    if (!prod) return;
    editandoId = id;
    document.getElementById("nombre").value = prod.nombre;
    document.getElementById("categoria").value = prod.categoria;
    document.getElementById("precio").value = prod.precio;
    document.getElementById("stock").value = prod.stock;
    document.getElementById("descripcion").value = prod.descripcion;
    document.getElementById("img").value = prod.img;
    document.getElementById("formTitle").textContent = "Editar Producto";
    document.getElementById("enviar").textContent = "Actualizar";
    document.getElementById("cancelEditBtn").style.display = "block";
}

function cancelarEdicion() {
    document.getElementById("formulario-producto").reset();
    editandoId = null;
    document.getElementById("formTitle").textContent = "Añadir Producto";
    document.getElementById("enviar").textContent = "Añadir Producto";
    document.getElementById("cancelEditBtn").style.display = "none";
    esborrarError();
}

function procesarFormulario() {
    let nombre = document.getElementById("nombre").value.trim();
    let categoria = document.getElementById("categoria").value;
    let precio = parseFloat(document.getElementById("precio").value);
    let stock = parseInt(document.getElementById("stock").value);
    let descripcion = document.getElementById("descripcion").value.trim();
    let img = document.getElementById("img").value.trim();

    if (editandoId !== null) {
        let index = catalogo.findIndex(p => p.id === editandoId);
        if (index !== -1) {
            catalogo[index] = { id: editandoId, nombre, categoria, precio, stock, descripcion, img };
            guardarStorage();
            filtrarYOrdenar();
            cancelarEdicion();
        }
    } else {
        let nuevoId = catalogo.length > 0 ? Math.max(...catalogo.map(p => p.id)) + 1 : 1;
        catalogo.push({ id: nuevoId, nombre, categoria, precio, stock, descripcion, img });
        guardarStorage();
        filtrarYOrdenar();
        cancelarEdicion();
    }
}

function eliminarProducto(id) {
    if (confirm("¿Eliminar producto?")) {
        catalogo = catalogo.filter(p => p.id !== id);
        guardarStorage();
        if (editandoId === id) cancelarEdicion();
        filtrarYOrdenar();
    }
}

// ========== VALIDACIONES (estilo reserva.js) ==========
function validar(e) {
    esborrarError();
    e.preventDefault();
    if (validarNombre() && validarCategoria() && validarPrecio() && validarStock() && validarDescripcion() && validarImagen() && confirm("Confirma si vols guardar el producte")) {
        document.getElementById("formulario-producto").requestSubmit();
        return true;
    } else {
        return false;
    }
}

function validarNombre() {
    var element = document.getElementById("nombre");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El nom és obligatori.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El nom ha de tenir entre 3 i 60 caràcters, només lletres, números i espais.");
        }
        return false;
    }
    return true;
}

function validarCategoria() {
    var element = document.getElementById("categoria");
    if (element.value === "" || element.value === null) {
        error(element, "Has de seleccionar una categoria.");
        return false;
    }
    return true;
}

function validarPrecio() {
    var element = document.getElementById("precio");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El preu és obligatori.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El preu ha de ser un número decimal positiu amb fins a dos decimals (ex: 199.99).");
        }
        return false;
    }
    if (parseFloat(element.value) <= 0) {
        error(element, "El preu ha de ser major que zero.");
        return false;
    }
    return true;
}

function validarStock() {
    var element = document.getElementById("stock");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "L'estoc és obligatori.");
        }
        if (element.validity.rangeUnderflow) {
            error(element, "L'estoc no pot ser negatiu.");
        }
        return false;
    }
    return true;
}

function validarDescripcion() {
    var element = document.getElementById("descripcion");
    if (element.value.trim() === "") {
        error(element, "La descripció és obligatòria.");
        return false;
    }
    if (element.value.length > 200) {
        error(element, "La descripció no pot superar els 200 caràcters.");
        return false;
    }
    return true;
}

function validarImagen() {
    var element = document.getElementById("img");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El nom de la imatge és obligatori.");
        }
        if (element.validity.patternMismatch) {
            error(element, "La imatge ha de terminar en .jpg, .png o .webp.");
        }
        return false;
    }
    return true;
}

function error(element, missatge) {
    let miss = document.createTextNode(missatge);
    document.getElementById("errorMensaje").appendChild(miss);
    element.classList.add("text-danger");
    element.focus();
}

function esborrarError() {
    document.getElementById("errorMensaje").textContent = "";
    let formulari = document.forms[0];
    for (let i = 0; i < formulari.elements.length; i++) {
        formulari.elements[i].classList.remove("text-danger");
    }
}
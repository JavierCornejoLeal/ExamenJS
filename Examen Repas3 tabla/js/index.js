document.addEventListener("DOMContentLoaded", main);

let catalogo = [];
let mostrados = [];
let ordenActual = "default";
let editandoId = null;
let opcionesAutocomplete = [];

async function main() {
    await cargarDatos();
    cargarCategoriasFiltro();
    filtrarYOrdenar();

    // Autocomplete
    opcionesAutocomplete = [];
    catalogo.forEach(prod => {
        if (!opcionesAutocomplete.includes(prod.nombre)) opcionesAutocomplete.push(prod.nombre);
        if (!opcionesAutocomplete.includes(prod.categoria)) opcionesAutocomplete.push(prod.categoria);
    });
    $("#buscar").autocomplete({ source: opcionesAutocomplete });

    // Eventos formulario
    let formulario = document.getElementById("formulario-producto");
    document.getElementById("enviar").addEventListener("click", validar, false);
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();
        procesarFormulario();
    });
    document.getElementById("cancelEditBtn").addEventListener("click", cancelarEdicion);

    // Filtros y orden
    document.getElementById("buscar").addEventListener("input", () => filtrarYOrdenar());
    document.getElementById("filtroCategoria").addEventListener("change", () => filtrarYOrdenar());
    document.getElementById("ordenDefault").addEventListener("click", () => { ordenActual = "default"; filtrarYOrdenar(); });
    document.getElementById("ordenAsc").addEventListener("click", () => { ordenActual = "asc"; filtrarYOrdenar(); });
    document.getElementById("ordenDesc").addEventListener("click", () => { ordenActual = "desc"; filtrarYOrdenar(); });
}

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
    pintarTabla();
}

function pintarTabla() {
    let tbody = document.getElementById("tabla-productos");
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    if (mostrados.length === 0) {
        let fila = document.createElement("tr");
        let celda = document.createElement("td");
        celda.colSpan = 6;
        celda.textContent = "No hay productos que coincidan";
        celda.className = "text-center";
        fila.appendChild(celda);
        tbody.appendChild(fila);
        return;
    }

    mostrados.forEach(prod => {
        let fila = document.createElement("tr");

        let celdaId = document.createElement("td");
        celdaId.textContent = prod.id;
        let celdaNombre = document.createElement("td");
        celdaNombre.textContent = prod.nombre;
        let celdaCat = document.createElement("td");
        celdaCat.textContent = prod.categoria;
        let celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = prod.precio.toFixed(2) + " €";
        let celdaStock = document.createElement("td");
        celdaStock.textContent = prod.stock;

        let celdaAcciones = document.createElement("td");
        let btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn btn-sm btn-warning me-1";
        btnEditar.addEventListener("click", () => cargarParaEditar(prod.id));

        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "btn btn-sm btn-danger me-1";
        btnEliminar.addEventListener("click", () => eliminarProducto(prod.id));

        let btnDetalle = document.createElement("a");
        btnDetalle.textContent = "Ver";
        btnDetalle.className = "btn btn-sm btn-info";
        btnDetalle.href = "detalle.html?id=" + prod.id;

        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnEliminar);
        celdaAcciones.appendChild(btnDetalle);

        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaCat);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaStock);
        fila.appendChild(celdaAcciones);

        tbody.appendChild(fila);
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

    if (editandoId !== null) {
        let index = catalogo.findIndex(p => p.id === editandoId);
        if (index !== -1) {
            catalogo[index] = { id: editandoId, nombre, categoria, precio, stock, descripcion };
            guardarStorage();
            filtrarYOrdenar();
            cancelarEdicion();
        }
    } else {
        let nuevoId = catalogo.length > 0 ? Math.max(...catalogo.map(p => p.id)) + 1 : 1;
        catalogo.push({ id: nuevoId, nombre, categoria, precio, stock, descripcion });
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

function validar(e) {
    esborrarError();
    e.preventDefault();
    if (validarNombre() && validarCategoria() && validarPrecio() && validarStock() && validarDescripcion() && confirm("Confirma si vols guardar el producte")) {
        document.getElementById("formulario-producto").requestSubmit();
        return true;
    } else {
        return false;
    }
}

function validarNombre() {
    var element = document.getElementById("nombre");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) error(element, "El nom és obligatori.");
        if (element.validity.patternMismatch) error(element, "El nom ha de tenir entre 3 i 60 caràcters, només lletres, números i espais.");
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
        if (element.validity.valueMissing) error(element, "El preu és obligatori.");
        if (element.validity.patternMismatch) error(element, "El preu ha de ser un número decimal positiu amb fins a dos decimals (ex: 199.99).");
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
        if (element.validity.valueMissing) error(element, "L'estoc és obligatori.");
        if (element.validity.rangeUnderflow) error(element, "L'estoc no pot ser negatiu.");
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
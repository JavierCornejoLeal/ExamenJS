document.addEventListener("DOMContentLoaded", main);

let productos = [];
let productosFiltrados = [];
let modoEdicion = false;

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────
async function main() {
    await cargarDatos();
    cargarCategorias();
    productosFiltrados = [...productos];
    pintarProductos(productosFiltrados);

    document.getElementById("btnEnviar").addEventListener("click", validar, false);
    document.getElementById("btnCancelar").addEventListener("click", cancelarEdicion, false);
    document.getElementById("btnRelevancia").addEventListener("click", ordenarRelevancia);
    document.getElementById("btnPrecioAlto").addEventListener("click", ordenarPrecioAlto);
    document.getElementById("btnPrecioBajo").addEventListener("click", ordenarPrecioBajo);
    document.getElementById("btnBuscar").addEventListener("click", buscar);
    document.getElementById("filtroCat").addEventListener("change", filtrarCategoria);

    // Autocomplete jQuery UI
    let sugerencias = [];
    productos.forEach(function (p) {
        if (!sugerencias.includes(p.nombre))    sugerencias.push(p.nombre);
        if (!sugerencias.includes(p.categoria)) sugerencias.push(p.categoria);
    });
    $("#buscador").autocomplete({
        source: sugerencias
    });

    document.getElementById("formulario-producto").addEventListener("submit", function (e) {
        e.preventDefault();
        if (modoEdicion) {
            actualizarProducto();
        } else {
            agregarProducto();
        }
        this.reset();
        cancelarEdicion();
    });
}

// ─────────────────────────────────────────────
//  LOCALSTORAGE
// ─────────────────────────────────────────────
async function cargarDatos() {
    let datosGuardados = JSON.parse(localStorage.getItem("catalogo"));
    if (datosGuardados && datosGuardados.length > 0) {
        productos = datosGuardados;
    } else {
        let respuesta = await fetch("js/bbdd.json");
        let json      = await respuesta.json();
        productos     = json.productos;
        guardarStorage();
    }
}

function guardarStorage() {
    localStorage.setItem("catalogo", JSON.stringify(productos));
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function pintarProductos(array) {
    let listado = document.getElementById("listado");

    while (listado.firstChild) {
        listado.removeChild(listado.firstChild);
    }

    if (array.length === 0) {
        let aviso = document.createElement("p");
        aviso.classList.add("text-muted", "text-center", "mt-4");
        aviso.textContent = "No se han encontrado productos.";
        listado.appendChild(aviso);
        return;
    }

    array.forEach(function (producto) {

        // Card
        let card = document.createElement("div");
        card.classList.add("card", "mb-4");

        // Card body
        let cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        // Título
        let titulo = document.createElement("h2");
        titulo.classList.add("card-title");
        titulo.textContent = producto.nombre;
        cardBody.appendChild(titulo);

        // Fila precio
        let rowPrecio = document.createElement("div");
        rowPrecio.classList.add("row", "justify-content-end");
        let cajaPrecio = document.createElement("div");
        cajaPrecio.classList.add("p-2", "mb-1", "col-md-4", "bg-warning", "rounded", "text-center");
        let textoPrecio = document.createElement("h4");
        textoPrecio.classList.add("font-weight-bold");
        textoPrecio.textContent = producto.precio + " €";
        cajaPrecio.appendChild(textoPrecio);
        rowPrecio.appendChild(cajaPrecio);
        cardBody.appendChild(rowPrecio);

        // Fila detalles — cabeceras
        let rowDetalles = document.createElement("div");
        rowDetalles.classList.add("row");

        let cabCat = document.createElement("div");
        cabCat.classList.add("col", "p-3", "text-center", "border-bottom", "border-dark");
        cabCat.textContent = "Categoría";
        rowDetalles.appendChild(cabCat);

        let cabStock = document.createElement("div");
        cabStock.classList.add("col", "p-3", "text-center", "border-bottom", "border-dark");
        cabStock.textContent = "Stock";
        rowDetalles.appendChild(cabStock);

        let salto = document.createElement("div");
        salto.classList.add("w-100");
        rowDetalles.appendChild(salto);

        // Fila detalles — valores
        let valCat = document.createElement("div");
        valCat.classList.add("col", "p-3", "text-center", "fw-bold");
        valCat.textContent = producto.categoria;
        rowDetalles.appendChild(valCat);

        let valStock = document.createElement("div");
        valStock.classList.add("col", "p-3", "text-center", "fw-bold");
        valStock.textContent = producto.stock + " uds.";
        rowDetalles.appendChild(valStock);

        cardBody.appendChild(rowDetalles);

        // Descripción
        let desc = document.createElement("p");
        desc.classList.add("mt-2", "text-muted");
        desc.textContent = producto.descripcion;
        cardBody.appendChild(desc);

        // Botones
        let btnDetalle = document.createElement("a");
        btnDetalle.classList.add("btn", "btn-info", "m-1");
        btnDetalle.href = "detalle.html?id=" + producto.id;
        btnDetalle.textContent = "Ver detalle";
        cardBody.appendChild(btnDetalle);

        let btnEditar = document.createElement("button");
        btnEditar.classList.add("btn", "btn-warning", "m-1");
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", function () {
            cargarFormularioEdicion(producto.id);
        });
        cardBody.appendChild(btnEditar);

        let btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn", "btn-danger", "m-1");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", function () {
            eliminarProducto(producto.id);
        });
        cardBody.appendChild(btnEliminar);

        card.appendChild(cardBody);
        listado.appendChild(card);
    });
}

// ─────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────
function agregarProducto() {
    let nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

    let nuevo = {
        id:          nuevoId,
        nombre:      document.getElementById("nombre").value,
        categoria:   document.getElementById("categoria").value,
        precio:      parseFloat(document.getElementById("precio").value),
        stock:       parseInt(document.getElementById("stock").value),
        descripcion: document.getElementById("descripcion").value,
        img:         document.getElementById("img").value
    };

    productos.push(nuevo);
    guardarStorage();
    productosFiltrados = [...productos];
    cargarCategorias();
    pintarProductos(productosFiltrados);
}

// ─────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────
function cargarFormularioEdicion(id) {
    let producto = productos.find(p => p.id === id);
    if (!producto) return;

    modoEdicion = true;
    document.getElementById("productoId").value    = producto.id;
    document.getElementById("nombre").value        = producto.nombre;
    document.getElementById("categoria").value     = producto.categoria;
    document.getElementById("precio").value        = producto.precio;
    document.getElementById("stock").value         = producto.stock;
    document.getElementById("descripcion").value   = producto.descripcion;
    document.getElementById("img").value           = producto.img;

    document.getElementById("tituloFormulario").textContent = "Editar producto";
    document.getElementById("btnEnviar").textContent        = "Actualizar";

    document.getElementById("formulario-producto").scrollIntoView({ behavior: "smooth" });
}

function actualizarProducto() {
    let id = parseInt(document.getElementById("productoId").value);
    let index = productos.findIndex(p => p.id === id);
    if (index === -1) return;

    productos[index].nombre      = document.getElementById("nombre").value;
    productos[index].categoria   = document.getElementById("categoria").value;
    productos[index].precio      = parseFloat(document.getElementById("precio").value);
    productos[index].stock       = parseInt(document.getElementById("stock").value);
    productos[index].descripcion = document.getElementById("descripcion").value;
    productos[index].img         = document.getElementById("img").value;

    guardarStorage();
    productosFiltrados = [...productos];
    cargarCategorias();
    pintarProductos(productosFiltrados);
}

function cancelarEdicion() {
    modoEdicion = false;
    document.getElementById("productoId").value             = "";
    document.getElementById("tituloFormulario").textContent = "Añadir producto";
    document.getElementById("btnEnviar").textContent        = "Añadir";
    document.getElementById("formulario-producto").reset();
    esborrarError();
}

// ─────────────────────────────────────────────
//  DELETE
// ─────────────────────────────────────────────
function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    let index = productos.findIndex(p => p.id === id);
    if (index === -1) return;

    productos.splice(index, 1);
    guardarStorage();
    productosFiltrados = [...productos];
    cargarCategorias();
    pintarProductos(productosFiltrados);
}

// ─────────────────────────────────────────────
//  BÚSQUEDA Y FILTRO
// ─────────────────────────────────────────────
function buscar() {
    let texto = document.getElementById("buscador").value.toLowerCase();
    productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto)
    );
    pintarProductos(productosFiltrados);
}

function filtrarCategoria() {
    let cat = document.getElementById("filtroCat").value.toLowerCase();
    if (cat === "") {
        productosFiltrados = [...productos];
    } else {
        productosFiltrados = productos.filter(p =>
            p.categoria.toLowerCase() === cat
        );
    }
    pintarProductos(productosFiltrados);
}

function cargarCategorias() {
    let select = document.getElementById("filtroCat");

    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    let optTodas = document.createElement("option");
    optTodas.value = "";
    optTodas.textContent = "Todas";
    select.appendChild(optTodas);

    let categorias = [];
    productos.forEach(function (p) {
        if (!categorias.includes(p.categoria)) {
            categorias.push(p.categoria);
        }
    });

    categorias.sort();
    categorias.forEach(function (cat) {
        let opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// ─────────────────────────────────────────────
//  ORDENACIÓN
// ─────────────────────────────────────────────
function ordenarRelevancia() {
    productosFiltrados = [...productos];
    pintarProductos(productosFiltrados);
}

function ordenarPrecioAlto() {
    productosFiltrados = [...productosFiltrados].sort((a, b) => b.precio - a.precio);
    pintarProductos(productosFiltrados);
}

function ordenarPrecioBajo() {
    productosFiltrados = [...productosFiltrados].sort((a, b) => a.precio - b.precio);
    pintarProductos(productosFiltrados);
}

// ─────────────────────────────────────────────
//  VALIDACIÓN (checkValidity)
// ─────────────────────────────────────────────
function validarNombre() {
    let element = document.getElementById("nombre");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El nom és obligatori. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "El nom ha de tindre entre 3 i 60 caràcters. ");
        }
        return false;
    }
    return true;
}

function validarCategoria() {
    let element = document.getElementById("categoria");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "La categoria és obligatoria. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "La categoria ha de tindre entre 2 i 40 caràcters. ");
        }
        return false;
    }
    return true;
}

function validarPrecio() {
    let element = document.getElementById("precio");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "El preu és obligatori. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "El preu ha de ser un número positiu (ex: 199.99). ");
        }
        return false;
    }
    return true;
}

function validarStock() {
    let element = document.getElementById("stock");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "L'stock és obligatori. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "L'stock ha de ser un número enter positiu. ");
        }
        return false;
    }
    return true;
}

function validarDescripcion() {
    let element = document.getElementById("descripcion");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "La descripció és obligatoria. ");
        }
        return false;
    }
    return true;
}

function validarImg() {
    let element = document.getElementById("img");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "La imatge és obligatoria. ");
        }
        if (element.validity.patternMismatch) {
            error(element, "La imatge ha d'acabar en .jpg, .png o .webp. ");
        }
        return false;
    }
    return true;
}

function validar(e) {
    esborrarError();
    e.preventDefault();
    if (validarNombre() && validarCategoria() && validarPrecio() && validarStock() && validarDescripcion() && validarImg() && confirm("Confirma si vols guardar el producte")) {
        document.getElementById("formulario-producto").requestSubmit();
        return true;
    } else {
        return false;
    }
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
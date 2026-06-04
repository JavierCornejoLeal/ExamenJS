// ==================== INICIO ====================
document.addEventListener("DOMContentLoaded", main);

// Variables globales (nombres descriptivos)
let catalogoProductos = [];      // Array con todos los productos
let productosFiltrados = [];     // Array después de aplicar búsqueda y filtro
let ordenActual = "default";     // 'default', 'price_asc', 'price_desc'
let productoEnEdicion = null;    // ID del producto que se está editando (null si es creación)
let palabrasAutocomplete = [];    // Para el autocomplete (nombres + categorías)

// ==================== FUNCIÓN PRINCIPAL ====================
async function main() {
    await cargarDatosIniciales();
    generarOpcionesFiltroCategoria();
    aplicarFiltrosYOrdenacion();
    configurarAutocomplete();

    // Eventos del formulario (igual que en reserva.js)
    const formulario = document.getElementById("productForm");
    document.getElementById("submitBtn").addEventListener("click", validarYEnviar, false);
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();
        procesarFormulario();
    });
    document.getElementById("cancelEditBtn").addEventListener("click", cancelarEdicion);

    // Eventos de búsqueda, filtro y ordenación
    document.getElementById("searchInput").addEventListener("input", () => aplicarFiltrosYOrdenacion());
    document.getElementById("categoryFilter").addEventListener("change", () => aplicarFiltrosYOrdenacion());
    document.getElementById("sortDefault").addEventListener("click", () => { ordenActual = "default"; aplicarFiltrosYOrdenacion(); });
    document.getElementById("sortPriceAsc").addEventListener("click", () => { ordenActual = "price_asc"; aplicarFiltrosYOrdenacion(); });
    document.getElementById("sortPriceDesc").addEventListener("click", () => { ordenActual = "price_desc"; aplicarFiltrosYOrdenacion(); });
}

// ==================== CARGA Y PERSISTENCIA (localStorage + JSON) ====================
async function cargarDatosIniciales() {
    const productosAlmacenados = localStorage.getItem("catalogo");
    if (productosAlmacenados) {
        catalogoProductos = JSON.parse(productosAlmacenados);
    } else {
        const respuesta = await fetch("productos.json");
        catalogoProductos = await respuesta.json();
        guardarEnLocalStorage();
    }
}

function guardarEnLocalStorage() {
    localStorage.setItem("catalogo", JSON.stringify(catalogoProductos));
}

// ==================== FILTRO POR CATEGORÍA (generación dinámica) ====================
function generarOpcionesFiltroCategoria() {
    const selectCategoria = document.getElementById("categoryFilter");
    const categoriasUnicas = [];
    for (let producto of catalogoProductos) {
        if (!categoriasUnicas.includes(producto.categoria)) {
            categoriasUnicas.push(producto.categoria);
        }
    }
    for (let categoria of categoriasUnicas) {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    }
}

// ==================== FILTRO (búsqueda + categoría) Y ORDENACIÓN ====================
function aplicarFiltrosYOrdenacion() {
    const textoBusqueda = document.getElementById("searchInput").value.toLowerCase();
    const categoriaSeleccionada = document.getElementById("categoryFilter").value;

    // Filtrar
    let filtrados = catalogoProductos.filter(producto => {
        const coincideTexto = producto.nombre.toLowerCase().includes(textoBusqueda) ||
                              producto.categoria.toLowerCase().includes(textoBusqueda);
        const coincideCategoria = (categoriaSeleccionada === "all") || producto.categoria === categoriaSeleccionada;
        return coincideTexto && coincideCategoria;
    });

    // Ordenar
    if (ordenActual === "price_asc") {
        filtrados.sort((a, b) => a.precio - b.precio);
    } else if (ordenActual === "price_desc") {
        filtrados.sort((a, b) => b.precio - a.precio);
    } else {
        filtrados.sort((a, b) => a.id - b.id);
    }

    productosFiltrados = filtrados;
    renderizarTabla();
}

// ==================== RENDERIZADO DE LA TABLA (uso intensivo del DOM) ====================
function renderizarTabla() {
    const tbody = document.getElementById("productTableBody");
    // Vaciar el tbody
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (productosFiltrados.length === 0) {
        const filaVacia = document.createElement("tr");
        const celdaMensaje = document.createElement("td");
        celdaMensaje.colSpan = 6;
        celdaMensaje.className = "text-center";
        celdaMensaje.textContent = "No hay productos que coincidan con los filtros.";
        filaVacia.appendChild(celdaMensaje);
        tbody.appendChild(filaVacia);
        return;
    }

    for (let producto of productosFiltrados) {
        const fila = document.createElement("tr");

        // ID
        const celdaId = document.createElement("td");
        celdaId.textContent = producto.id;
        fila.appendChild(celdaId);

        // Nombre
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = producto.nombre;
        fila.appendChild(celdaNombre);

        // Categoría
        const celdaCategoria = document.createElement("td");
        celdaCategoria.textContent = producto.categoria;
        fila.appendChild(celdaCategoria);

        // Precio
        const celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = producto.precio.toFixed(2) + " €";
        fila.appendChild(celdaPrecio);

        // Stock
        const celdaStock = document.createElement("td");
        celdaStock.textContent = producto.stock;
        fila.appendChild(celdaStock);

        // Acciones (botones)
        const celdaAcciones = document.createElement("td");

        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";
        botonEditar.className = "btn btn-sm btn-warning me-2";
        botonEditar.addEventListener("click", (function(id) {
            return function() { cargarProductoParaEditar(id); };
        })(producto.id));

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "btn btn-sm btn-danger me-2";
        botonEliminar.addEventListener("click", (function(id) {
            return function() { eliminarProducto(id); };
        })(producto.id));

        const enlaceDetalle = document.createElement("a");
        enlaceDetalle.textContent = "Ver detalle";
        enlaceDetalle.className = "btn btn-sm btn-info";
        enlaceDetalle.href = `detalle.html?id=${producto.id}`;

        celdaAcciones.appendChild(botonEditar);
        celdaAcciones.appendChild(botonEliminar);
        celdaAcciones.appendChild(enlaceDetalle);
        fila.appendChild(celdaAcciones);

        tbody.appendChild(fila);
    }
}

// ==================== CRUD: UPDATE (cargar producto en formulario) ====================
function cargarProductoParaEditar(idProducto) {
    const producto = catalogoProductos.find(p => p.id === idProducto);
    if (!producto) return;

    productoEnEdicion = idProducto;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("categoria").value = producto.categoria;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("stock").value = producto.stock;
    document.getElementById("descripcion").value = producto.descripcion;

    document.getElementById("formTitle").textContent = "Editar Producto";
    document.getElementById("submitBtn").textContent = "Actualizar Producto";
    document.getElementById("cancelEditBtn").style.display = "block";
}

function cancelarEdicion() {
    document.getElementById("productForm").reset();
    productoEnEdicion = null;
    document.getElementById("formTitle").textContent = "Añadir Producto";
    document.getElementById("submitBtn").textContent = "Añadir Producto";
    document.getElementById("cancelEditBtn").style.display = "none";
    borrarErrores();
}

// ==================== PROCESAR FORMULARIO (CREATE / UPDATE) ====================
function procesarFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value;
    const precio = parseFloat(document.getElementById("precio").value);
    const stock = parseInt(document.getElementById("stock").value);
    const descripcion = document.getElementById("descripcion").value.trim();

    if (productoEnEdicion !== null) {
        // UPDATE
        const indice = catalogoProductos.findIndex(p => p.id === productoEnEdicion);
        if (indice !== -1) {
            catalogoProductos[indice] = {
                id: productoEnEdicion,
                nombre: nombre,
                categoria: categoria,
                precio: precio,
                stock: stock,
                descripcion: descripcion
            };
            guardarEnLocalStorage();
            aplicarFiltrosYOrdenacion();
            cancelarEdicion();
        }
    } else {
        // CREATE: generar nuevo ID (máximo ID actual + 1)
        let nuevoId = 1;
        if (catalogoProductos.length > 0) {
            const ids = catalogoProductos.map(p => p.id);
            nuevoId = Math.max(...ids) + 1;
        }
        const nuevoProducto = {
            id: nuevoId,
            nombre: nombre,
            categoria: categoria,
            precio: precio,
            stock: stock,
            descripcion: descripcion
        };
        catalogoProductos.push(nuevoProducto);
        guardarEnLocalStorage();
        aplicarFiltrosYOrdenacion();
        cancelarEdicion();
    }
}

// ==================== DELETE con confirmación ====================
function eliminarProducto(idProducto) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        catalogoProductos = catalogoProductos.filter(producto => producto.id !== idProducto);
        guardarEnLocalStorage();
        if (productoEnEdicion === idProducto) cancelarEdicion();
        aplicarFiltrosYOrdenacion();
    }
}

// ==================== AUTOCOMPLETE (jQuery UI) ====================
function configurarAutocomplete() {
    palabrasAutocomplete = [];
    for (let producto of catalogoProductos) {
        if (!palabrasAutocomplete.includes(producto.nombre)) palabrasAutocomplete.push(producto.nombre);
        if (!palabrasAutocomplete.includes(producto.categoria)) palabrasAutocomplete.push(producto.categoria);
    }
    $("#searchInput").autocomplete({
        source: palabrasAutocomplete
    });
}

// Función principal que se llama al hacer clic en el botón "Enviar"
function validarYEnviar(event) {
    borrarErrores();
    event.preventDefault();
    if (validarNombre() && validarCategoria() && validarPrecio() && validarStock() && validarDescripcion() && confirm("¿Confirma que desea guardar el producto?")) {
        document.getElementById("productForm").requestSubmit();
        return true;
    } else {
        return false;
    }
}

// Validación individual del campo nombre
function validarNombre() {
    const campo = document.getElementById("nombre");
    if (!campo.checkValidity()) {
        if (campo.validity.valueMissing) {
            error(campo, "El nombre del producto es obligatorio.");
        } else if (campo.validity.patternMismatch) {
            error(campo, "El nombre debe tener entre 3 y 60 caracteres, solo letras, números y espacios.");
        } else {
            error(campo, "Nombre no válido.");
        }
        return false;
    }
    return true;
}

function validarCategoria() {
    const campo = document.getElementById("categoria");
    if (campo.value === "" || campo.value === null) {
        error(campo, "Debes seleccionar una categoría.");
        return false;
    }
    return true;
}

function validarPrecio() {
    const campo = document.getElementById("precio");
    if (!campo.checkValidity()) {
        if (campo.validity.valueMissing) {
            error(campo, "El precio es obligatorio.");
        } else if (campo.validity.patternMismatch) {
            error(campo, "Formato de precio incorrecto. Ejemplo: 199.99");
        } else {
            error(campo, "Precio no válido.");
        }
        return false;
    }
    if (parseFloat(campo.value) <= 0) {
        error(campo, "El precio debe ser mayor que cero.");
        return false;
    }
    return true;
}

function validarStock() {
    const campo = document.getElementById("stock");
    if (!campo.checkValidity()) {
        if (campo.validity.valueMissing) {
            error(campo, "El stock es obligatorio.");
        } else if (campo.validity.rangeUnderflow) {
            error(campo, "El stock no puede ser negativo.");
        } else {
            error(campo, "Stock no válido.");
        }
        return false;
    }
    return true;
}

function validarDescripcion() {
    const campo = document.getElementById("descripcion");
    if (campo.value.trim() === "") {
        error(campo, "La descripción es obligatoria.");
        return false;
    }
    if (campo.value.length > 200) {
        error(campo, "La descripción no puede superar los 200 caracteres.");
        return false;
    }
    return true;
}

// Funciones error y borrarErrores (idénticas a reserva.js)
function error(elemento, mensaje) {
    const textoError = document.createTextNode(mensaje);
    document.getElementById("errorMessage").appendChild(textoError);
    elemento.classList.add("text-danger");
    elemento.focus();
}

function borrarErrores() {
    document.getElementById("errorMessage").textContent = "";
    const formulario = document.forms[0];
    for (let i = 0; i < formulario.elements.length; i++) {
        formulario.elements[i].classList.remove("text-danger");
    }
}
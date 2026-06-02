document.addEventListener("DOMContentLoaded", main);
let listaProductos = []; 

async function main() {
    await cargarLocalStorage()
}

async function cargarLocalStorage() {
    let productosGuardados = JSON.parse(localStorage.getItem("catalogo"));
    if(productosGuardados && productosGuardados > 0){
        listaProductos = productosGuardados;
        return;
    }
    const respuesta = await fetch("productos.json");
    const datosJSON = await respuesta.json();
    listaProductos = datosJSON;
    guardarEnLocalStorage();
    console.log(datosJSON);
}

function guardarEnLocalStorage() {
    localStorage.setItem("catalogo", JSON.stringify(listaProductos));
}

function renderizarTabla() {
    const tbody = document.getElementById("cuerpoTabla");
    while(tbody.firstChild) tbody.removeChild(tbody.firstChild);

    
}
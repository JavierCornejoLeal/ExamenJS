document.addEventListener("DOMContentLoaded", main);
// Obtener coches del localStorage
let datos           = JSON.parse(localStorage.getItem("datos"));
let datosFormulario = [];

function main() {
    let formularioReserva = document.getElementById("formulario-reserva");
    document.getElementById("enviar").addEventListener("click", validar, false);

    formularioReserva.addEventListener("submit", function (event) {
        event.preventDefault();

        let nombreApellidos = document.getElementById("nombreApellidos").value;
        let dniCifNia       = document.getElementById("dniCifNia").value;
        let email           = document.getElementById("email").value;
        let telefono        = document.getElementById("telefono").value;
        let nota            = document.getElementById("nota").value;
        agregarReserva(nombreApellidos, dniCifNia, email, telefono, nota)
        formularioReserva.reset();
        window.location.href = "index.html";
        console.log("DatosFormulario actualizado:", datosFormulario);
    });

    cargarReserva()
    console.log(datos);

    
}

function cargarReserva() {
    // Obtener index desde la URL
    let parametros = new URLSearchParams(window.location.search);
    let index      = parametros.get("index");

    // Obtener coche seleccionado
    let coche = datos[index];

    // Titulo
    document.querySelector(".card-title").textContent = coche.marca + " " + coche.modelo;

    // Precio
    document.querySelector(".font-weight-bold").textContent = coche.precio + " €";

    // Imagen
    document.querySelector(".card-img-top").src = "img/" + coche.img;

    // Todos los strong
    let strongs = document.querySelectorAll("strong");
    strongs[0].textContent = coche.anyo;
    strongs[1].textContent = coche.km + " km";
    strongs[2].textContent = coche.cambio;
    strongs[3].textContent = coche.combustible;
}

function agregarReserva(nombreApellidos, dniCifNia, email, telefono, nota) {
    let nuevaReserva = {nombreApellidos, dniCifNia, email, telefono, nota};
    
    // Actualitzar la variable global amb les dades del localStorage
    datosFormulario = JSON.parse(localStorage.getItem('reserva')) || [];
    datosFormulario.push(nuevaReserva);
    
    // Passar la variable global a la funció de guardar
    guardarDatosStorage(datosFormulario);
}

function guardarDatosStorage(datos) {
    localStorage.setItem('reserva', JSON.stringify(datos));
}

function validarNom() {
    var element = document.getElementById("nombreApellidos");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Deus d'introduïr un nom.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El nom y apellidos ha de tindre entre 4 i 40 caracters.");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarDni() {
    var element = document.getElementById("dniCifNia");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Deus d'introduïr un DNI/CIF/NIA.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El DNI/CIF/NIA ha de tindre 10 caracter");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarEmail() {
    var element = document.getElementById("email");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Deus d'introduïr email");
        }
        if (element.validity.patternMismatch) {
            error(element, "El email te que ser como este: ejemplo@dominio.com");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarTel() {
    var element = document.getElementById("telefono");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Deus d'introduïr un telèfon.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El telèfon ha de tindre el format: (999) 999-999.");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarCheck() {
    var element = document.getElementById("aceptar");
    if (!element.checked) {
        error(element, "Has d'acceptar les condicions d'ús.");
        return false;
    }
    return true;
}

function validar(e) {
    esborrarError();
    e.preventDefault();
    if (validarNom() && validarDni() && validarEmail() && validarTel() && validarCheck() && confirm("Confirma si vols enviar el formulari")) {
        document.getElementById("formulario-reserva").requestSubmit();
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
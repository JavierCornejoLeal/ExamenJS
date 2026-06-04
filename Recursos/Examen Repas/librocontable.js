document.addEventListener("DOMContentLoaded", main);

let datos           = [];
let datosFormulario = [];
let ara = new Date(Date.now()).toISOString().split('T')[0];

async function main() {
    
    let formulario = document.getElementById("form-libro-contable");
    document.getElementById("grabar").addEventListener("click", validar, false);
    document.getElementById("fecha").setAttribute("max", ara);
    document.getElementById("concepto").setAttribute("maxlength", "50");

    formulario.addEventListener("submit", function (event) {
        if (event.submitter?.id === "grabar") {
            return;
        }
        

        let fecha = document.getElementById("fecha").value;
        let concepto = document.getElementById("concepto").value;
        let tipo = document.getElementById("tipo").value;
        let importe = document.getElementById("importe").value;

        agregarRegistro(fecha, concepto, tipo, importe);

        formulario.reset();
    });
    await cargarDatos();
    pintarDatos();
}

async function cargarDatos() {
    let datosAlmacenados = JSON.parse(localStorage.getItem('datos'));
    if (datosAlmacenados && datosAlmacenados.length > 0) {
        datos = datosAlmacenados;
        return;
    }
    let informacio = await fetch('data.json');
    datos          = await informacio.json();
    console.log(datos);
    guardarDatosStorage(datos);
}

function guardarDatosStorage(datos) {
    localStorage.setItem('datos', JSON.stringify(datos));
}

function pintarDatos() {
    let datosStorage = JSON.parse(localStorage.getItem('datos')) || [];
    let tabla = document.getElementById('tabla-libro-contable');
    while (tabla.firstChild) {
        tabla.removeChild(tabla.firstChild);
    }
    datosStorage.forEach((element, index) => {
        let fila = document.createElement('tr');
        fila.classList.add("fs-5");
        
        let borrar        = document.createElement('td');
        let btnBorrar     = document.createElement('button');
        let btnBorrarText = document.createTextNode('Borrar');
        btnBorrar.appendChild(btnBorrarText);
        btnBorrar.addEventListener('click', () => borrarRegistro(index));
        borrar.appendChild(btnBorrar);
        btnBorrar.classList.add("btn", "btn-danger", "btn-sm");
        fila.appendChild(borrar);

        let fecha     = document.createElement('td');
        let fechaNode = document.createTextNode(element.fecha);
        fecha.appendChild(fechaNode);
        fila.appendChild(fecha);

        let concepto     = document.createElement('td');
        let conceptoNode = document.createTextNode(element.concepto);
        concepto.appendChild(conceptoNode);
        fila.appendChild(concepto);

        let dh     = document.createElement('td');
        let dhNode = document.createTextNode(element.tipo);
        dh.appendChild(dhNode);
        fila.appendChild(dh);

        let importe     = document.createElement('td');
        let importeNode = document.createTextNode(element.importe);
        importe.appendChild(importeNode);
        fila.appendChild(importe);

        let saldo    = document.createElement('td');
        let saldoNode = document.createTextNode(element.saldo);
        saldo.appendChild(saldoNode);

        if (parseFloat(element.saldo) < 0) {
            saldo.classList.add("bg-danger", "text-white");
        }
        fila.appendChild(saldo);
        tabla.appendChild(fila);
    });
    calcularSaldoTotal();
}

function calcularSaldoTotal() {
    let datosStorage = JSON.parse(localStorage.getItem('datos')) || [];
    let total        = datosStorage.reduce((acc, reg) => {
        if (reg.tipo === 'H') {
            return acc + parseFloat(reg.importe);
        } else {
            return acc - parseFloat(reg.importe);
        }

    }, 0);
    let saldoTotal         = document.getElementById("saldo-total");
    saldoTotal.textContent = total.toFixed(2);
    if (total < 0) {
        saldoTotal.classList.add("text-danger");
    } else {
        saldoTotal.classList.remove("text-danger");
    }
}

function borrarRegistro(index) {
    if (confirm("¿Deseas eliminar este apunte?")) {
    datos.splice(index, 1);
    guardarDatosStorage(datos);
    pintarDatos();
    }
}

function agregarRegistro(fecha, concepto, tipo, importe) {
    let datosStorage   = JSON.parse(localStorage.getItem('datos')) || [];
    let saldoAcumulado = datosStorage.reduce((acc, reg) => reg.tipo === 'H' ? acc + parseFloat(reg.importe) : acc - parseFloat(reg.importe), 0 );
    if (tipo === 'H') {
        saldoAcumulado += parseFloat(importe);
    } else {
        saldoAcumulado -= parseFloat(importe);
    }
    let nuevoRegistro = { fecha, concepto, tipo, importe, saldo: saldoAcumulado.toFixed(2) };
    datos.push(nuevoRegistro);
    guardarDatosStorage(datos);
    pintarDatos();
}

function validarFecha() {
    var element = document.getElementById("fecha");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Deus d'introduïr una data.");
        }
        if (element.validity.rangeOverflow) {
            error(element, `La data màxima ha de ser inferior al ${ara}.`);
        }
        if (element.validity.rangeUnderflow) {
            error(element, "La data mínima ha de ser superior al 01/01/1900.");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarConcepto() {
    var element = document.getElementById("concepto");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Debes introducir un concepto.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El conceprto tiene que ser de maximo 50 caracteres.");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarTipo() {
    var element = document.getElementById("tipo");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Debes introducir un tipo.");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarImporte() {
    var element = document.getElementById("importe");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Debes introducir un importe");
        }
        //error(element);
        return false;
    }
    return true;
}

function validar(e) {
    esborrarError();
    e.preventDefault();
    if (validarFecha() && validarConcepto() && validarTipo() && validarImporte() && confirm("Confirma si vols enviar el formulari")) {
        document.getElementById("form-libro-contable").requestSubmit();
    } else {
        return false;
    }
}

function error(element, missatge) {
    let miss = document.createTextNode(missatge);
    document.getElementById("missatgeError").appendChild(miss);
    element.classList.add("error");
    element.focus();
}

function esborrarError() {
    document.getElementById("missatgeError").textContent = "";
    let formulari = document.forms[0];
    for (let i = 0; i < formulari.elements.length; i++) {
        formulari.elements[i].classList.remove("error");
    }
}




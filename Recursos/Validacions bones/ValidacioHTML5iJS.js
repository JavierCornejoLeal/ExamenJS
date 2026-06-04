

// iniciar app

window.onload = iniciar;

function iniciar (){

    document.getElementById("enviar").addEventListener("click", validar,false);

} 

function validarNom () {
      var element = document.getElementById("nom");
      if (!element.checkValidity()){
          if (element.validity.valueMissing){
              error(element,"Deus d'introduïr un nom.");
          }
          if (element.validity.patternMismatch){
              error(element, "El nom ha de tindre entre 2 i 14 caracters.");
          }
          //error(element);
          return false;
      }
      return true;

}

function validarNeix (){
    var element = document.getElementById("neix");
    if (!element.checkValidity()){
        if (element.validity.valueMissing){
            error(element,"Deus d'introduïr una data.");
        }
        if (element.validity.rangeOverflow){
            error(element, "La data mínima ha de ser superior al 01/01/1900.");
        }
        if (element.validity.rangeUnderflow){
            error(element, "La data màxima ha de ser inferior al 31/12/2020.");
        }
        //error(element);
        return false;
    }
    return true;
}

function validarTel (){
    var element = document.getElementById("tel");
    if (!element.checkValidity()){
        if (element.validity.valueMissing){
            error(element,"Deus d'introduïr un telèfon.");
        }
        if (element.validity.patternMismatch){
            error(element,"El telèfon ha de tindre el format 999 999 999.");
        }
        //error(element);
        return false;
    }
    return true;
}



function validar (e) {
    esborrarError ();
    if (validarNom() && validarNeix() && validarTel() && confirm("Confirma si vols enviar el formulari") ){
        return true;
    } else{
        return false;
    }
}

function error (element, missatge){
    let miss=document.createTextNode(missatge);    
    document.getElementById("missatgeError").appendChild(miss);
    element.classList.add("error");
    element.focus();
}


function esborrarError (){
    document.getElementById("missatgeError").textContent="";
    let formulari = document.forms[0];
        for ( let i=0; i < formulari.elements.length; i++){
            formulari.elements[i].classList.remove("error");
        }
}
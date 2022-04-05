//print(str.substring(indexINI,indexFIN));

//CARACTERES A USAR: https://www.kreatibu.com/recursos-gratis-para-disenadores/herramientas/emoticonos-para-facebook#icono-japones

var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000
});

const textarea = document.getElementById('copiarTXT');
const cInputTextarea = document.getElementById('cInput');
cInputTextarea.addEventListener('change', updateValue);
function updateValue(e) {

    let nColum = document.getElementById('nColumnas').value;
    identarHorizontal(e.target.value, parseInt(nColum));

    txtFocus();

}

textarea.addEventListener('click', function () {

    let nColum = document.getElementById('nColumnas').value;
    identarHorizontal(cInputTextarea.value, parseInt(nColum));

    txtFocus();

})

function txtFocus(){
    textarea.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');

    Toast.fire({
        icon: 'success',
        title: 'Texto Copiado'
    })
}

function identarHorizontal(str, nSaltos) {

    var MAPA = {
        CARACTER: [],
        POSICION: []
    }

    for (let index = 0; str[index]; index++) {
        if (str[index] == '(' || str[index] == ')') {
            MAPA.CARACTER.push(str[index]);
            MAPA.POSICION.push(index);
        }
    }

    function printGrupo(inicio, final) {
        var cOriginal = cAlterdo = str.substring(inicio, final);
        cAlterdo = cAlterdo.replaceAll(',', 'チ');
        str = str.replace(cOriginal, cAlterdo);
    }

    for (let index = 0; MAPA.CARACTER[index]; index++) {
        if (MAPA.CARACTER[index] == ')') {
            let j = index - 1;
            while (MAPA.POSICION[j]) {
                if (MAPA.CARACTER[j] == '(') {
                    MAPA.CARACTER[j] = '1';
                    MAPA.CARACTER[index] = '2';
                    printGrupo(MAPA.POSICION[index] + 1, MAPA.POSICION[j]);
                    break;
                }
                j -= 1;
            }
        }
    }

    var nCadMax = 0;
    const words = str.split(',');
    for (let i = 0; words[i]; i++) {
        let nCadenaLen = words[i].trim().length;
        if (nCadMax < nCadenaLen) {
            nCadMax = nCadenaLen;
        }
    }

    var cTxtFinal = '';
    var nBreak = nSaltos - 1;

    for (let i = 0; words[i]; i++) {
        let nCadenaLen = words[i].trim().length;
        cTxtFinal += words[i].trim();
        for (let index = 0; index < (nCadMax - nCadenaLen); index++) {
            cTxtFinal += ' ';
        }

        if (words[i + 1]) {
            cTxtFinal += ', ';
        }

        if (nBreak == i) {
            nBreak += nSaltos;
            cTxtFinal += '\n';
        }
    }

    cTxtFinal = cTxtFinal.replaceAll('チ', ',');
    //console.log(cTxtFinal);

    document.getElementById('cInput').value = cTxtFinal;
    
}


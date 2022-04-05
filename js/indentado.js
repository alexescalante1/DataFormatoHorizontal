//===========================================================================================
//INICIALIZACION
//===========================================================================================


var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
});

let txtMyContent = '';
for (let index = 0; index < 10; index++) {

    txtMyContent += `
        <h5 id="viewTitle${index}">GENERATE</h5>
        <textarea style="width: 100%;" rows="10" id="WiewContent${index}"></textarea>
        <label for="WiewContent${index}" id="copiar${index}" class="btn btn-dark">
          <i class="fa fa-copy">&nbsp;&nbsp;COPIAR</i>
        </label><br><br>

        <script>
        const textar${index} = document.getElementById('copiar${index}');
        textar${index}.addEventListener('click', function () {
        
            textar${index}.focus();
            document.execCommand('selectAll');
            document.execCommand('copy');
        
            Toast.fire({
                icon: 'success',
                title: 'Texto Copiado'
            })
        })
        </script>
        `;

}

$("#MyContent").html(txtMyContent);
//document.getElementById('MyContent').innerHTML = txtMyContent;
var NItemView = 0;

//===========================================================================================
//FILTRO
//===========================================================================================


function GFiltro(filtro,value){
    switch (filtro) {
        case 1:
            return `dbo.GEN_EnmascararCadena_FN(${value},0,1)`;
        case 2:
            return `dbo.GEN_EnmascararCadenaCorreo_FN(${value},0)`;
        case 3:
            return `dbo.GEN_MezclarCaracteres_FN(${value})`;
        default:
            break;
    }
    return;
}


//===========================================================================================
//DESORDENAR NAME
//===========================================================================================

class clsDesorderName {
    constructor(tbItem, tbID, dataItems, dataTipoD, dataFltro) {
        this.tbNtVw = NItemView;
        this.tbItem = tbItem;
        this.tbID = tbID;
        this.LDATA = new Array();
        for (let index = 0; index < dataItems.length; index++) {
            let DATA = new Object();
            DATA.item = dataItems[index];
            DATA.tipo = dataTipoD[index];
            DATA.fltro = dataFltro[index];
            this.LDATA.push(DATA);
        }
        this.Dtipo = { 0: 'VARCHAR(500)', 1: 'INT', 2: 'FLOAT'}
        NItemView += 1;
    }

    CTE_CAMBIO(tabla, item, index) {

        let Orden;
        if (index % 2) {
            Orden = `ASC`;
        } else {
            Orden = `DESC`;
        }

        var innerCodeTXT = `
;WITH CTE_Cambio AS (
    SELECT
        A.[${item}] AS cCampoActualizar${index},
        ROW_NUMBER() OVER (
            ORDER BY
                A.[${item}] ${Orden}
        ) AS idOrden
    FROM
        dbo.${tabla} A
)
UPDATE
    B
SET
    B.cCampoActualizar${index} = A.cCampoActualizar${index}
FROM
    CTE_Cambio A,
    @dtDatosTabla1 B
WHERE
    A.idOrden = B.id

`;
        return innerCodeTXT;
    }

    MOSTRAR_CODE() {
        var innerCodeTXT =
`--===========================================================================================
--DESORDEN NAME dbo.${this.tbItem}
--===========================================================================================
        
DECLARE @dtDatosTabla1 TABLE (
    id INT IDENTITY PRIMARY KEY,
    idOriginal INT,`;
        for (let index = 0; index < this.LDATA.length; index++) {
            innerCodeTXT += `
    cCampoActualizar${index + 1} ${this.Dtipo[this.LDATA[index]["tipo"]]}`;
            if (index + 1 != this.LDATA.length) {
                innerCodeTXT += `,`;
            }
        }
        innerCodeTXT += `
)
INSERT INTO
    @dtDatosTabla1 (idOriginal)
SELECT
    A.[${this.tbID}]
FROM
    dbo.${this.tbItem} A

`;

        for (let index = 0; index < this.LDATA.length; index++) {
            innerCodeTXT += this.CTE_CAMBIO(this.tbItem, this.LDATA[index]["item"], index + 1);
        }

        innerCodeTXT += `UPDATE A SET`;
        for (let index = 0; index < this.LDATA.length; index++) {
            var campoAct = `B.cCampoActualizar${index + 1}`;
            if(this.LDATA[index]["fltro"]!=0){
                campoAct = GFiltro(this.LDATA[index]["fltro"],campoAct);
            }
            innerCodeTXT += `
    A.[${this.LDATA[index]["item"]}] = ${campoAct}`;
            if (index + 1 != this.LDATA.length) {
                innerCodeTXT += `,`;
            }
        }

        innerCodeTXT += `
FROM @dtDatosTabla1 B, ${this.tbItem} A WHERE A.[${this.tbID}] = B.idOriginal

GO`;

        //console.log(innerCodeTXT);
        document.getElementById('WiewContent' + this.tbNtVw).value = innerCodeTXT;
        document.getElementById('viewTitle' + this.tbNtVw).innerHTML = `DESORDEN ${this.tbNtVw}: ${this.tbItem}`;

    }

}


//===========================================================================================
//DESORDEN ONE WITH
//===========================================================================================


class clsDesorderOne {
    constructor(tbItem, tbID, dataItems, dataTipoD, dataFltro) {
        this.tbNtVw = NItemView;
        this.tbItem = tbItem;
        this.tbID = tbID;
        this.LDATA = new Array();
        for (let index = 0; index < dataItems.length; index++) {
            let DATA = new Object();
            DATA.item = dataItems[index];
            DATA.tipo = dataTipoD[index];
            DATA.fltro = dataFltro[index];
            this.LDATA.push(DATA);
        }
        this.Dtipo = { 0: 'VARCHAR(500)', 1: 'INT', 2: 'FLOAT'}
        NItemView += 1;
    }

    MOSTRAR_CODE() {
        var innerCodeTXT = 
`--===========================================================================================
--DESORDEN dbo.${this.tbItem}
--===========================================================================================

DECLARE @dtDatosTabla TABLE (
    id INT IDENTITY PRIMARY KEY,
    idOriginal INT,`;
        for (let index = 0; index < this.LDATA.length; index++) {
            innerCodeTXT += `
    cCampoActualizar${index + 1} ${this.Dtipo[this.LDATA[index]["tipo"]]}`;
            if (index + 1 != this.LDATA.length) {
                innerCodeTXT += `,`;
            }
        }
        innerCodeTXT += `
)
INSERT INTO
    @dtDatosTabla (idOriginal)
SELECT
    A.[${this.tbID}]
FROM
    dbo.${this.tbItem} A

;WITH CTE_Cambio AS (
    SELECT`;

    for (let index = 0; index < this.LDATA.length; index++) {
        var campoAct = `A.[${this.LDATA[index]["item"]}]`;
        if(this.LDATA[index]["fltro"]!=0){
            campoAct = GFiltro(this.LDATA[index]["fltro"],campoAct);
        }
        innerCodeTXT += `
        ${campoAct} AS cCampoActualizar${index + 1},`;
    }
    innerCodeTXT += `
        ROW_NUMBER() OVER (
            ORDER BY
                A.[${this.LDATA[0]["item"]}] DESC
        ) AS idOrden
    FROM
        dbo.${this.tbItem} A
)
UPDATE
    B
SET`;

for (let index = 0; index < this.LDATA.length; index++) {
    innerCodeTXT += `
    B.cCampoActualizar${index + 1} = A.cCampoActualizar${index + 1}`;
    if (index + 1 != this.LDATA.length) {
        innerCodeTXT += `,`;
    }
}

innerCodeTXT += `
FROM
    CTE_Cambio A,
    @dtDatosTabla B
WHERE
    A.idOrden = B.id 

`;
        innerCodeTXT += `UPDATE A SET`;
        for (let index = 0; index < this.LDATA.length; index++) {
            innerCodeTXT += `
    A.[${this.LDATA[index]["item"]}] = B.cCampoActualizar${index + 1}`;
            if (index + 1 != this.LDATA.length) {
                innerCodeTXT += `,`;
            }
        }

        innerCodeTXT += `
FROM @dtDatosTabla B, ${this.tbItem} A WHERE A.[${this.tbID}] = B.idOriginal

GO`;

        //console.log(innerCodeTXT);
        document.getElementById('WiewContent' + this.tbNtVw).value = innerCodeTXT;
        document.getElementById('viewTitle' + this.tbNtVw).innerHTML = `DESORDEN ${this.tbNtVw}: ${this.tbItem}`;

    }

}



//===========================================================================================
//UPDATE ONE
//===========================================================================================


class clsUptadeOne {
    constructor(tbItem, tbID, dataItems, dataFltro) {
        this.tbNtVw = NItemView;
        this.tbItem = tbItem;
        this.tbID = tbID;
        this.LDATA = new Array();
        for (let index = 0; index < dataItems.length; index++) {
            let DATA = new Object();
            DATA.item = dataItems[index];
            DATA.fltro = dataFltro[index];
            this.LDATA.push(DATA);
        }
        NItemView += 1;
    }

    MOSTRAR_CODE() {
        var innerCodeTXT =
`--===========================================================================================
-- UPDATE dbo.${this.tbItem}
--===========================================================================================

UPDATE
    A
SET`;


for (let index = 0; index < this.LDATA.length; index++) {
    var campoAct = `A.[${this.LDATA[index]["item"]}]`;
    if(this.LDATA[index]["fltro"]!=0){
        campoAct = GFiltro(this.LDATA[index]["fltro"],campoAct);
    }
    innerCodeTXT += `
    A.[${this.LDATA[index]["item"]}] = ${campoAct}`;
    if (index + 1 != this.LDATA.length) {
        innerCodeTXT += `,`;
    }
}

innerCodeTXT += `
FROM
    dbo.${this.tbItem} A

GO
`;


//WHERE
//    A.[${this.tbID}] IS NULL
//    OR A.[${this.tbID}] = 0
//
        //console.log(innerCodeTXT);
        document.getElementById('WiewContent' + this.tbNtVw).value = innerCodeTXT;
        document.getElementById('viewTitle' + this.tbNtVw).innerHTML = `UPDATE ${this.tbNtVw}: ${this.tbItem}`;

    }

}

//===========================================================================================
//DATA
//===========================================================================================



var dataItems;
var dataTipoD;//0=VARCHAR,1=INT,2=FLOAT
var dataFltro;//0=NULL

//dataItems = ["cApellidoPaterno", "cApellidoMaterno", "cNombre", "cApellidoCasado", "CNombreSeg", "cNombreOtros"];
//dataTipoD = [0, 0, 0, 0, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
//dataFltro = [0, 0, 0, 0, 0, 0];//0=NULL
//
//let MyFormTK = new clsDesorderName('SI_FinClienteNatural', "idCli", dataItems, dataTipoD, dataFltro);
//MyFormTK.MOSTRAR_CODE();

dataItems = ["cNumeroTelefonico"];
dataTipoD = [0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [3];//0=NULL

let TLFNO = new clsDesorderName('dbo.SI_FINNotificacionSMS', "idCliente", dataItems, dataTipoD, dataFltro);
TLFNO.MOSTRAR_CODE();


dataItems = ["val1", "val2", "val3", "val4","val5","val6","val7","val8","val9","val10","val11","val12"];
dataTipoD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//0=NULL

let juridico = new clsDesorderName('#TMP_JURD', "idCli", dataItems, dataTipoD, dataFltro);
juridico.MOSTRAR_CODE();

dataItems = ["cApellidoPaterno", "cApellidoMaterno", "cNombre", "cNombreSeg","cNombreCasado","cNombreOtros"];
dataTipoD = [0, 0, 0, 0, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [0, 0, 0, 0, 0, 0];//0=NULL

let TEMP = new clsDesorderName('#TMPF', "cTablas", dataItems, dataTipoD, dataFltro);
TEMP.MOSTRAR_CODE();

dataItems = ["cApellidoPaterno", "cApellidoMaterno", "cNombre"];
dataTipoD = [0, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [0, 0, 0];//0=NULL

let ASISTEC = new clsDesorderName('SI_FINAsistenteTecnico', "cDocumentoID", dataItems, dataTipoD, dataFltro);
ASISTEC.MOSTRAR_CODE();


dataItems = ["cApePatRem", "cApeMatRem", "cNombreRem"];
dataTipoD = [0, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [0, 0, 0];//0=NULL

let MyFormTK5 = new clsDesorderName('SI_FinServicioGiro', "idCliRem", dataItems, dataTipoD, dataFltro);
MyFormTK5.MOSTRAR_CODE();


dataItems = ["cApePatDes", "cApeMatDes", "cNombreDes"];
dataTipoD = [0, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [0, 0, 0];//0=NULL

let MyFormTK6 = new clsDesorderName('SI_FinServicioGiro', "idCliDes", dataItems, dataTipoD, dataFltro);
MyFormTK6.MOSTRAR_CODE();


dataItems = ["DNI", "Nombres y Apellidos","Cargo"];
dataTipoD = [2, 0, 0];//0=VARCHAR,1=INT,2=FLOAT
dataFltro = [0, 3, 3];//0=NULL

let MyFormTK2 = new clsDesorderOne('Planilla201501', "N°", dataItems, dataTipoD, dataFltro);
MyFormTK2.MOSTRAR_CODE();



dataItems = ["cDatosAval"];
dataFltro = [1];//0=NULL

let MyFormTK3 = new clsUptadeOne('SI_FinDatosReporteRNC', "idCli", dataItems, dataFltro);
MyFormTK3.MOSTRAR_CODE();



var viewSAllTxt = '';
var list = ["Planilla201501",
            "SI_FINAsistenteTecnico",
            "SI_FINAsociacionAsisTec",
            "SI_FinBaseNegativaClientes",
            "SI_FinBiometriaExcep",
            "SI_FINcachePI2_Iden",
            "SI_FinCliente",
            "SI_FinClienteJuridico_Aud",
            "SI_FinClienteNatural",
            "SI_FinClienteNatural_Aud",
            "SI_FinClienteNaturalMigra",
            "SI_FINClientesDifCodSBS",
            "SI_FinClientesOpeInusualSPLAFT",
            "SI_FinCliRiesgoSobreEndeuda",
            "SI_FinCompraVenta",
            "Si_FinCreJorReferencias",
            "SI_FinDatosReporteRNC",
            "SI_FinDetalleExpediente",
            "SI_FINDetallePep",
            "SI_FINDetalleRegOpeSplaft",
            "SI_FinDetCargaMasivaAho",
            "SI_FinDetKarCompraVenta",
            "SI_FinEmiChequeBco",
            "SI_FinEmpresaConvenio",
            "SI_FinEntidadFinanciera",
            "SI_FinEnvioBoletas",
            "SI_FinErrorDepositoMasivo",
            "SI_FINExcepcionNotificacionSMS",
            "SI_FINFamiliaresPEP",
            "SI_FINGarantia",
            "SI_FinGrupoSolidario",
            "SI_FinHisCobranzaBN",
            "SI_FINHisGarantia",
            "SI_FinListaOfaq",
            "SI_FinLogActualizacionCorreos",
            "SI_FinLogAhorroWeb",
            "SI_FinMovimientoBanco",
            "SI_FINNoCliente",
            "SI_FINNotificacionSMS",
            "SI_FINOferta",
            "SI_FinPDPComisiones",
            "SI_FinPDPLogUsuario",
            "SI_FINPreSolicitud",
            "SI_FinRCAIdenCli",
            "SI_FinRCCIdenCli",
            "SI_FinRCCODIdenCli",
            "SI_FinReferenciaEval",
            "SI_FinRegistroEncuestaFeria",
            "SI_FinRegistroEncuestaRespuesta",
            "SI_FinRenDatosConsultados",
            "SI_FINResumenScoringRCC",
            "SI_FinServicioGiro",
            "SI_FinSolicitudAprobacion",
            "SI_FinSolicitudDesbloqPersonaBN",
            "SI_FinSustentoOperacion",
            "SI_FINTasadores",
            "SI_FinTramiteAhorroWeb",
            "SI_FINVinculadosOpeMultSPLAFT",
            "SI_FinClienteJuridico",
            "SI_FinCreditosPreAprobados"];

list.forEach(element => {
    viewSAllTxt += `
    SELECT TOP 5 * FROM dbo.`+element;
});

document.getElementById('WiewContent' + NItemView).value = viewSAllTxt;
document.getElementById('viewTitle' + NItemView).innerHTML = `DESORDEN ${NItemView}: SELECT ALL`;
NItemView += 1;
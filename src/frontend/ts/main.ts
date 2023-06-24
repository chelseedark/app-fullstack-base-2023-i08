declare const M;

/*Construye el aspecto HTML del modal*/
const modalContent = `
<div class="modal-content">
    <h4>Agregar dispositivo</h4>
    <div class="row">
        <form class="col s12">
            <div class="row">
                <div class="input-field col s6">
                    <input type="text" id="nuevo_nombre" name="nuevo_nombre" value="" placeholder="Nombre del dispositivo">
                    <label for="nuevo_nombre">Nombre</label>
                </div>
                <div class="input-field col s6">
                    <input type="text" id="nueva_descripcion" name="nueva_descripcion" value="" placeholder="Descripción">
                    <label for="nueva_descripcion">Descripción</label>
                </div>
            </div>
        </form>
    </div>
    <div class="row">
        <div class="input-field col s6">
            <select id="nuevo_tipo" class="icons">
                <option value="0" data-icon="../static/images/0.png" class="left">Lámpara</option>
                <option value="1" data-icon="../static/images/1.png" class="left">Persiana</option>
            </select>
            <label>Seleccione el tipo de dispositivo</label>
        </div>
        <div class="input-field col s6">
            <label>
                <input type="checkbox" id="nuevo_dimmer" class="filled-in" />
                <span class="checkmark"></span>
                <span>Dimerizable</span>
            </label>
        </div>
    </div>
    <div class="modal-footer">
        <button id="boton_agregar" class="btn waves-effect waves-light purple">
            <i class="material-icons left">add_box</i>Agregar
        </button>
    </div>
</div>
`;
/*Clase principal*/
class Main implements EventListenerObject, ResponseLister {
      public framework: FrameWork = new FrameWork();
    constructor() {
        this.framework.enviar_request("GET", "http://localhost:8000/listdevices", this)
    }
    /*Acá se podría validar los diferentes campos de datos,
     * actualmente solo el campo name*/
    private validateName(datos): boolean {

        if (datos.name != "") {
            return (true)
        };

        return (false)
    }
    /*Construye el aspecto del modal*/
    private buildAddDevModal():string {
        return modalContent;
    };
    /*Acá se podría consultar la base de datos para todos los tipos de listas*/
    private build_type_list (type:number):string{
        let lista_tipos:string = "";
        let type_names = ["Lámpara", "Persiana"]  
        for (var i in type_names) {
            let j = parseInt(i);
            let selected = (( j = type )? "selected": "");
            lista_tipos += `<option ${selected} value="${i}" data-icon="../static/images/${i}.png">`+ type_names[i] +`</option>`
        }
        return(lista_tipos)
    };
    /*Manejador de eventos para el menú de los dispositivos*/
    public _solicitudes(status: number, response: string) {
        if (status == 200) {
            let respuesta_string: string = response;
            let respuesta: Array<Device> = JSON.parse(respuesta_string);
            let panel_div = document.getElementById("panel");
            let mostrar_datos: string = `<ul class="collection">`;
    
            for (let dispositivo of respuesta) {
                let dimmer: boolean = dispositivo.dimmable;
                let cambio_entrada: string;
                let typeOptions: string = this.build_type_list(dispositivo.type);
    
                if (dimmer) {
                    cambio_entrada = `
                        <div class="secondary-content">
                            <form action="#">
                                <p class="range-field">
                                    <input type="range" id="rg_${dispositivo.id}" min="0" value="${dispositivo.state}" max="10" />
                                </p>
                            </form>
                        </div>
                    `;
                } else {
                    let dimmer_activo: string = (dispositivo.state > 1) ? 'checked="checked"' : "";
                    cambio_entrada = `
                        <a href="#!" class="secondary-content">
                            <div class="switch">
                                <label>
                                    Off
                                    <input type="checkbox" id="cb_${dispositivo.id}" ${dimmer_activo} />
                                    <span class="lever"></span>
                                    On
                                </label>
                            </div>
                        </a>
                    `;
                }
    
                let listado_imagenes = `
                    <li href="#!" class="collection-item avatar z-depth-3">
                        <img src="../static/images/${dispositivo.type}.png" alt="" class="circle">
                        <span class="title nombreDisp">${dispositivo.name}</span>
                        ${cambio_entrada}
                    </li>
                `;
    
                let listado_edicion = `
                    <div class="row">
                        <form class="col s12">
                            <div class="row">
                                <div class="input-field col s6">
                                    <input type="text" id="fname_${dispositivo.id}" name="fname_${dispositivo.id}" value="${dispositivo.name}" placeholder="${dispositivo.name}">
                                    <label for="fname_${dispositivo.id}">Nombre:</label>
                                </div>
                                <div class="input-field col s6">
                                    <input type="text" id="fdescription_${dispositivo.id}" name="fdescription_${dispositivo.id}" value="${dispositivo.description}" placeholder="${dispositivo.description}">
                                    <label for="fdescription_${dispositivo.id}">Descripción:</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="row">
                        <div class="col s4">
                            <label for="ftype_${dispositivo.id}">
                                <select class="icons" id="ftype_${dispositivo.id}">
                                    ${typeOptions}
                                </select>
                                <label>Select device type</label>
                            </label>
                        </div>
                        <div class="input-field col s4">
                            <label for="fdimm_${dispositivo.id}">
                                <input type="checkbox" id="fdimm_${dispositivo.id}" class="filled-in" ${dimmer ? 'checked="checked"' : ''} />
                                <span>Dimerizable</span>
                            </label>
                        </div>
                    </div>
                `;
    
                let botones_lista = `
                    <div class="right-align">
                        <button id="btn_update_${dispositivo.id}" class="btn waves-effect waves-light button-view purple">
                            <i class="material-icons left">sync</i>Actualizar
                        </button>
                        <button id="btn_delete_${dispositivo.id}" class="btn waves-effect waves-light button-view red">
                            <i class="material-icons left">delete_forever</i>Borrar
                        </button>
                    </div>
                `;
    
                let detalles = `
                    <details>
                        <summary>${listado_imagenes}</summary>
                        ${listado_edicion}
                        ${botones_lista}
                    </details>
                `;
    
                mostrar_datos += detalles;
            }
    
            mostrar_datos += `</ul>`;
            panel_div.innerHTML = mostrar_datos;
    
            var selectElems = document.querySelectorAll('select');
            var selectInstances = M.FormSelect.init(selectElems, "");
    
            var elems2 = document.querySelectorAll('.fixed-action-btn');
            var instances_float = M.FloatingActionButton.init(elems2, {
                direction: 'top',
                hoverEnabled: true
            });
    
            M.updateTextFields();
    
            for (let dispositivo of respuesta) {
                let checkbox = document.getElementById("cb_" + dispositivo.id);
                let range = document.getElementById("rg_" + dispositivo.id);
    
                if (dispositivo.dimmable) {
                    range.addEventListener("click", this);
                } else {
                    checkbox.addEventListener("click", this);
                }
    
                let btnDelete = document.getElementById("btn_delete_" + dispositivo.id);
                btnDelete.addEventListener("click", this);
    
                let btnUpdate = document.getElementById("btn_update_" + dispositivo.id);
                btnUpdate.addEventListener("click", this);
            }
        } else {
            alert("Error al cargar el dispositivo");
        }
    }
    /*Eventos para la actualización de dipositivos*/
    _actualizar_dispositivo(status: number, response: string) {
        if (status == 200) {
            M.toast({ html: 'Dispositivo actualizado correctamente' })
           
        } else {
            M.toast({ html: 'Error al actualizar' })
        }
    }
    /*Eventos cuando de agregan dipositivos*/
    _agregar_dispositivo(status: number, response: string) {
        if (status == 200) {
            M.toast({ html: 'Se agregó un dispositivo' })

        } else {
            M.toast({ html: 'Error al actualizar' })
        }
    }
     /*Eventos para cuando se eliminan dipositivos*/  
    _eliminar_dispositivo(status: number, response: string) {
        if (status == 200) {
            M.toast({ html: 'Se eliminó un dispositivo' })

        } else {
            M.toast({ html: 'Error al borrar un dispositivo' })
        }

    }
     /*Manejador de eventos para la validación de dipositivos*/
    _validar_usuario(status: number, response: string) {

        if(response == "OK"){
            let panel_div = document.getElementById("panel");
            panel_div.hidden = false;
            let cajaMod = document.getElementById("btn_modal");
            cajaMod.hidden = false;
            M.toast({ html: 'Acceso al registro' })
        }else{
            M.toast({ html: 'Acceso incorrecto - Debe registrarse primero' })
        }

    }
     /*Manejador de eventos para la página web*/
    public handleEvent(evento: Event): void {
        const objeto_evento = <HTMLInputElement>evento.target;
        console.log("target: " + evento.target);
    
        if (evento.type === "click") {
            if (objeto_evento.id.startsWith("cb_")) {
                // Actualiza el estado del dispositivo (On=10 - Off=0)
                const state: number = objeto_evento.checked ? 10 : 0;
                const datos = { "id": objeto_evento.id.substring(3), "state": state };
                this.framework.enviar_request("POST", "http://localhost:8000/updateState/", this, datos);
            } else if (objeto_evento.id.startsWith("btn_delete_")) {
                // Elimina un dispositivo
                const datos = { "id": objeto_evento.id.substring(11) };
                this.framework.enviar_request("POST", "http://localhost:8000/deleteDevice/", this, datos);
            } else if (objeto_evento.id.startsWith("btn_update")) {
                // Actualiza un dispositivo
                const datos = {} as any;
                datos.id = objeto_evento.id.substring(11);
                datos.name = (document.getElementById("fname_" + datos.id) as HTMLInputElement).value;
                datos.description = (document.getElementById("fdescription_" + datos.id) as HTMLInputElement).value;
                datos.dimmable = (document.getElementById("fdimm_" + datos.id) as HTMLInputElement).checked ? 1 : 0;
                datos.type = (document.getElementById("ftype_" + datos.id) as HTMLSelectElement).selectedIndex;
                
                if (this.validateName(datos)) {
                    this.framework.enviar_request("POST", "http://localhost:8000/updateDevice/", this, datos);
                } else {
                    M.toast({ html: 'El campo nombre no puede estar vacío' });
                }
            } else if (objeto_evento.id === "boton_agregar") {
                // Agrega un dispositivo
                const fname = (document.getElementById("nuevo_nombre") as HTMLInputElement).value;
                const fdescription = (document.getElementById("nueva_descripcion") as HTMLInputElement).value;
                const ftype = (document.getElementById("nuevo_tipo") as HTMLInputElement).value;
                const fdimmable = (document.getElementById("nuevo_dimmer") as HTMLInputElement).checked ? 1 : 0;
                const fstat = 0;
                const datos = { "name": fname, "description": fdescription, "state": fstat, "type": ftype, "dimmable": fdimmable };
                
                console.log(datos);
                
                if (this.validateName(datos)) {
                    this.framework.enviar_request("POST", "http://localhost:8000/insertDevice/", this, datos);
                    (document.getElementsByClassName("modal-content")[0] as HTMLElement).style.display = "none";
                } else {
                    M.toast({ html: 'El campo nombre no puede estar vacío' });
                }
            } else if (objeto_evento.id === "btn_Add_Device") {
                // Agregar un dispositivo
                const add_device_modal = document.getElementById("modal_add_device") as HTMLElement;
                add_device_modal.innerHTML = this.buildAddDevModal();
                const elems1 = document.querySelectorAll('.modal');
                const instances_modal = M.Modal.init(elems1, "");
                const btn2 = document.getElementById("boton_agregar");
                btn2.addEventListener("click", this);
            } else if (objeto_evento.id.startsWith("rg_")) {
                // Actualiza el valor de estado de los dispositivos dimerizables
                const id = objeto_evento.id.substring(3);
                const datos = { "id": objeto_evento.id.substring(3), "state": (document.getElementById("rg_" + id) as HTMLInputElement).value };
                this.framework.enviar_request("POST", "http://localhost:8000/updateState/", this, datos);
            } else if (objeto_evento.id === "btnLogin") {
                // Validar usuario
                const datos = { "username": (document.getElementById("username") as HTMLInputElement).value, "password": (document.getElementById("password") as HTMLInputElement).value };
                this.framework.enviar_request("POST", "http://localhost:8000/loginUser", this, datos);
            } else {
                M.toast({ html: "Se hizo algo distinto en " + evento.type + " " + objeto_evento.id });
            }
        }
    
        this.framework.enviar_request("GET", "http://localhost:8000/listdevices", this);
    }
}
 /*Se gestiona la escucha de eventos*/
window.addEventListener("load", () => {
    document.querySelectorAll('select').forEach((elem) => {
        M.FormSelect.init(elem, "");
    });
    
    M.updateTextFields();
    
    const main = new Main();
    
    document.querySelectorAll('.fixed-action-btn').forEach((elem) => {
        M.FloatingActionButton.init(elem, { direction: 'top', hoverEnabled: true });
    });
    
    const btn = document.getElementById("btn_Add_Device");
    btn.addEventListener("click", main);
    
    const btn_log = document.getElementById("btnLogin");
    btn_log.addEventListener("click", main);
});








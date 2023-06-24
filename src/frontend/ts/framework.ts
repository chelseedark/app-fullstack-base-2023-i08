 /*Clase para el manejo de solicitudes*/

class FrameWork {
  public enviar_request(metodo: string, url: string, lister: ResponseLister, data?: any) {
    const xmlHttp: XMLHttpRequest = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4) {// 4 si todo OK
        if (metodo === "GET") {
          lister._solicitudes(xmlHttp.status, xmlHttp.responseText);
        } else if (metodo === "POST") {
          if (url.includes("/updateDevice/")) {
            lister._actualizar_dispositivo(xmlHttp.status, xmlHttp.responseText);
          } else if (url.includes("deleteDevice")) {
            lister._eliminar_dispositivo(xmlHttp.status, xmlHttp.responseText);
          } else if (url.includes("insertRow")) {
            lister._agregar_dispositivo(xmlHttp.status, xmlHttp.responseText);
          } else if (url.includes("loginUser")) {
            lister._validar_usuario(xmlHttp.status, xmlHttp.responseText);
          }
        }
      }
    };

    xmlHttp.open(metodo, url, true);
    if (metodo === "POST") {
      xmlHttp.setRequestHeader("Content-Type", "application/json");
      xmlHttp.send(JSON.stringify(data));
    } else {
      xmlHttp.send();
    }
  }

  public recoverElement(id: string): HTMLElement | null {
    return document.getElementById(id);
  }
}

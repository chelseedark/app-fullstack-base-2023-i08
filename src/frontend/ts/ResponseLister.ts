 /*En este archivo se pueden agregar rutinas auxiliares*/

  /*Interfaz para el manejo de solicitudes*/
interface ResponseLister{
    _solicitudes(status: number, response: string);
    _actualizar_dispositivo(status:number,response:string);
    _eliminar_dispositivo(status:number,response:string);
    _agregar_dispositivo(status:number,response:string);
    _validar_usuario(status:number, response:string);
}
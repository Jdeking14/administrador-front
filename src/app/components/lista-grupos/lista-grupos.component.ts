import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GrupoItemComponent } from '../grupo-item/grupo-item.component';
import { GroupService } from '../../services/group.service';
import { UsuariosService } from '../../services/user.service';
import { IGroup } from '../../interfaces/igroup';
import { CrearGruposComponent } from "../crear-grupos/crear-grupos.component";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { COLORS } from '../../utils/colors';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-lista-grupos',
    standalone: true,
    templateUrl: './lista-grupos.component.html',
    styleUrl: './lista-grupos.component.css',
    imports: [RouterLink, GrupoItemComponent, CrearGruposComponent]
})
export class ListaGruposComponent {
  authService = inject(AuthService)
  groupService = inject(GroupService)
  groups: IGroup[] = []
  colors: string[] = COLORS  
  credentials = {
    email: '',
    password: ''
  };
  
  constructor(private modalService: NgbModal, private usuariosService: UsuariosService, private router: Router) { }

  ngOnInit() {
    this.login()
    this.getGroups()
    
  }

  async getGroups(): Promise<void> {
    const {user_id:userId} = this.authService.getUserData()
    // console.log(await this.groupService.getAll())
    console.log("asada" + userId);
    this.groups = await this.groupService.getAll(userId)
    console.log("dfs" + this.groups);
  }

  getColorGroup(index: number) {
    return this.colors[index % this.colors.length]
  }

  openCrearGrupoModal() {
    const modalRef = this.modalService.open(CrearGruposComponent);
    modalRef.componentInstance.groupCreated.subscribe(async () => {
      await this.getGroups()
    });
  } 
  async login() {
    try {
      // Espera la respuesta de la Promesa devuelta por el servicio de login
      const response: any = await this.usuariosService.login(1);
  
      // Manejo de la respuesta del login
      console.log('Login exitoso:', response);
      
      // Convierte el token a string
      const token = String(response.jwt);
      
      // Guarda el token en el almacenamiento local
      localStorage.setItem('token', token);
      
      // Decodifica el token
      const decodedToken: any = jwtDecode(token);
      
      // Guarda el nombre del usuario en el almacenamiento local
      localStorage.setItem('email', decodedToken.email);
      localStorage.setItem('role', decodedToken.role);
      localStorage.setItem('firstName', decodedToken.firstName);
  
      // Emite el evento de autenticación
      this.usuariosService.authEventEmiter.emit();
  
      // Redirige a la página principal o a otra página después del login
      this.router.navigate(['/home']);
      
    } catch (err) {
      // Manejo de errores
      console.error('Error en el login:', err);
      Swal.fire({
        title: 'Error',
        text: 'Usuario o contraseña incorrectos',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}

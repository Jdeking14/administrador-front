import { Component, inject, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../services/group.service';
import { IGroup } from '../../interfaces/igroup';
import { GastosListComponent } from '../gastos-list/gastos-list.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/user.service';
import { Usuario } from '../../interfaces/iusuario';



@Component({
  selector: 'app-grupo-view',
  standalone: true,
  imports: [GastosListComponent,NgbDropdownModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './grupo-view.component.html',
  styleUrl: './grupo-view.component.css'
})

export class GrupoViewComponent {
  @ViewChild('modalContent') modalContent: TemplateRef<any> | undefined;
  activatedRoute = inject(ActivatedRoute)
  router = inject(Router)
  group!: IGroup
  editing: boolean = false;
  inputs: string[] = [];
  email: string = '';
  members: any = [];
  isAdmin: boolean = false;
  authService = inject(AuthService)
  user: any = {}
  groupLoaded: boolean = false
  users: Usuario[] = []; 
  selectedUser: string = ''; 

  

  constructor(private modalService: NgbModal, private groupService: GroupService, private userService: UsuariosService) {
    this.group = { 
      "id": 0,
      "name": '',
      "description": ''
    };
  }


  
  ngOnInit() {

    this.activatedRoute.params.subscribe(async (params:any) => {
      const id = params.id
      try {
        this.user = this.authService.getUserData()
        console.log(this.user)
        console.log(this.user)    
        this.group = await this.groupService.getById(id)
        this.members = await this.groupService.getGroupMembers(id)
        const [userData] = this.members.filter((m:any) => m.id === this.user.user_id)
        console.log(this.members)
        console.log(userData)
        this.isAdmin = userData.isAdmin
        console.log(this.members)
        console.log(this.isAdmin)
        this.user = userData
        this.groupLoaded = true
        this.loadUsers()
      } catch (error) {
        this.router.navigate(['/home'])
      }
    });
    

  }

  loadUsers() {
    this.userService.getAll().then((data: Usuario[]) => {
      this.users = data; // Asigna los usuarios a la variable `users`
      if (this.users.length > 0) {
        this.selectedUser = this.users[0].firstName; // Asigna el primer usuario como seleccionado
      }
    }).catch(error => {
      console.error('Error al cargar los usuarios:', error);
    });
  }

 

  editMode() {
    this.editing = !this.editing
  }

  editGroup(): boolean | void {
    this.groupService.updateById(this.group)
    this.editMode()
  }

  applyEdit(form: NgForm){
    form.value.id = this.group.id
    this.group = form.value;
    console.log(this.group)
    this.editGroup()
  }

  async onDelete(){
    const {value: deleteGroup} = await Swal.fire({
      title: `Would you like delete group '${this.group.name}'?`,
      icon: 'warning',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      showCancelButton: true,
      confirmButtonColor: '#DC3545',
      showCloseButton: true
    })
    // const deleteGroup = confirm(`Would you like delete ${this.group.name}`)
    if(deleteGroup && this.group.id !== undefined){
      this.groupService.deleteById(this.group.id).then(async ()=>{
        await Swal.fire({
          title: "Deleted!",
          text: `'${this.group.name}' has been deleted!`,
          icon: "success"
        });
        this.router.navigate(['/group/:id'])
      })
    }
  }
  openModal() {
    const modalRef = this.modalService.open(this.modalContent);
    modalRef.result.finally(()=>{
      this.clearInput();
    })
  }

  clearInput() {
    this.email = '';
  }

  addInput() {
    this.inputs.push('');
  }
  /**
   * Aqui uso pipe para encadenar los multiples emails que se pueden enviar del modal.
   * Uso tap para enviar cada email
   */
  sendInputs(form: NgForm) {
    const usuario = this.users.find(user => user.email === this.selectedUser);
    this.email = usuario ? usuario.email : '';
    const name = usuario ? usuario.firstName : '';
    if (form.valid) {
      const payload = { email: this.email, groupId: form.value.groupId};
      this.groupService.sendInputs(payload).pipe(
        tap(response => {
          Swal.fire({
            title: '¡Éxito!',
            text: `Se ha invitado a ${name} correctamente.`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.userService.userEmitter.emit('User invitado')
          this.modalService.dismissAll();
        }),
        catchError(error => {
          Swal.fire({
            title: 'Error',
            text: 'Usuario existente en el grupo, no registrado o incorrecto',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error('Error sending inputs:', error);
          return of(null);
        })
      ).subscribe();
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, rellena todos los campos.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }
    // Función trackBy para mejorar el rendimiento de *ngFor
    trackByIndex(index: number, item: any): any {
      return index;
    }
}

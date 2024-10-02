import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from '../../services/group.service';
import { UsuariosService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-members-group',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-members-group.component.html',
  styleUrl: './edit-members-group.component.css'
})
export class EditMembersGroupComponent {
  @Input() members: any;
  @Input() user: any;
  @Input() idGroup: number = 0
  groupService = inject(GroupService)
  userService = inject(UsuariosService)
  modalService = inject(NgbModal);
  formulario: FormGroup;

  constructor(){
    this.formulario = new FormGroup({
      // porcenaje: new FormControl(),
    });
  }

  ngOnInit(){
    console.log(this.user)
    
  }

  suma100 = true
  onSubmit(formulario: FormGroup){
    this.suma100 = false;
    console.log(formulario.value)
      this.userService.userEmitter.emit()
      this.modalService.dismissAll()
  }
  checkError(field: number, validator: string): boolean | undefined {
    const fieldStringfied = field.toString()
    return this.formulario.get(fieldStringfied)?.hasError(validator) && this.formulario.get(fieldStringfied)?.touched;
  }
  onMemberDelete(member:any){
    const memberName = `${member.firstName} ${member.lastName}` 
    Swal.fire({
      title: `Are you sure to delete member ${memberName}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.groupService.deleteGroupMembersByIdUser(this.idGroup,member.id)
        Swal.fire({
          title: "Deleted!",
          text: `Member ${memberName} has been deleted.`,
          icon: "success"
        });
        
        this.userService.userEmitter.emit()
        // this.formulario.removeControl(`${member.id}`)
        // this.formulario = new FormGroup({})
        // this.members = this.members.map((m:any)=>{
        //   return m.id !== member.id
        // })
        // this.buildForm()
        this.modalService.dismissAll()
      }
    });
  }
}

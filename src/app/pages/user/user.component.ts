import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ErrorDialogPopupComponent } from 'src/app/components/error-dialog-popup/error-dialog-popup.component';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { FFQFoodNutrients } from 'src/app/models/ffqfoodnutrients';
import { FFQFoodItem } from 'src/app/models/ffqfooditem';
import { FFQNutrientlist, nutrientMap } from 'src/app/models/ffqnutrientlist';
import { NutrientConstants } from 'src/app/models/NutrientConstants';
import { NutrientsService } from 'src/app/services/nutrients/nutrients-service';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ParentService } from 'src/app/services/parent/parent-service';
import { ClinicianService } from 'src/app/services/clinician/clinician-service';
import { FFQClinicianResponse } from 'src/app/models/ffqclinician-response';
import { FFQParent } from 'src/app/models/ffqparent';
import { FFQClinician } from 'src/app/models/ffqclinician';
import { FFQParentResponse } from 'src/app/models/ffqparent-response';
import { FFQClinicResponse } from 'src/app/models/ffqclinic-response';
import { ClinicService } from 'src/app/services/clinic/clinic-service';
import { FFQClinic } from 'src/app/models/ffqclinic';


@Component({
  selector: 'app-fooditem',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  TITLE = 'FFQR Food Item Portal';
  private routeSub: Subscription;
  private isNew: boolean;
  private isUpdate: boolean;
  private createParents: boolean;
  private createClinician: boolean;
  showMsg: boolean = false;
  selectedClinic: string;

  constructor(
    public parentService: ParentService,
    public clinicianService: ClinicianService,
    private errorDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    public clinicService: ClinicService

    ) { }

  userAttributes: object;
  dataLoaded: Promise<boolean>;

  ffqclinician: FFQClinician;
  ffqParent: FFQParent;
  amountToAdd: number;
  isParent: boolean;
  isClinician: boolean;
  //newClinic: string;
  //newClinician: FFQClinician;
  //newParent: FFQParent;

  public ffqclinicList: FFQClinic[] = [];
  clinicNames: string[] = [];
  clinicIds: Map<string, string> = new Map<string, string>();

    
  ngOnInit() {

    this.createParents = false;
    this.createClinician = false;
    this.isParent = false;
    this.isClinician = false;
    this.clinicNames.push("");

    const UserType = this.route.snapshot.paramMap.get('type');
    const UserID = this.route.snapshot.paramMap.get('id'); 

    if (UserID == "new")
    {
      this.isNew = true;
      this.dataLoaded = Promise.resolve(true);
    }
    else
    {
      this.isUpdate = true;
      if(UserType == "p")
      {
        this.getParentByID(UserID);
      }
      else
      {
        this.getClinicianByID(UserID);
      }
    }

    var clinicListObservable: Observable<FFQClinicResponse[]> = this.clinicService.getAllClinics();
    clinicListObservable.subscribe(clinicList => {
      this.ffqclinicList = clinicList;
      clinicList.forEach(clinic => {
        this.clinicIds.set(clinic.clinicname, clinic.clinicId);
        this.clinicNames.push(clinic.clinicname);
      })

    });

  }

  changeToClinician($event)
  {
    this.createClinician = true;
    this.createParents = false;
  }

  changeToParent($event)
  {
    this.createParents = true;
    this.createClinician = false;
  }

  private addUser()
  {  
     if(this.createClinician == true)
     {
        this.addClinician();
     }
     else
     {
        //for(var count: number = 1; count <= this.amountToAdd; count++)
        //{
          this.addParent();
        //}
     }
  }

  addClinician()
  {
    var clinicianList: Observable<FFQClinicianResponse[]> = this.clinicianService.getAllClinicians();

      clinicianList.subscribe(data => {
        var numberOfClinicians = (data.length+1).toString();
        //console.log("Number of clinicians is: " + numberOfClinicians);
        var newClincianId = (data.length+1).toString();
        var newClincianUsername = "clinician"+numberOfClinicians;
        this.ffqclinician = new FFQClinician(newClincianId, newClincianUsername, newClincianUsername, "clinician", "", "", "", this.selectedClinic, []);
        console.log(this.ffqclinician);

        this.clinicianService.addClinician(this.ffqclinician).subscribe(data => {
            this.router.navigateByUrl('/admin/users');
            const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
            dialogRef.componentInstance.title = newClincianUsername + ' was added!';
        },
        error =>{
            const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
            dialogRef.componentInstance.title = error.error.message;
        }); 

      });
  }

  addParent()
  {
    var parentList: Observable<FFQParentResponse[]> = this.parentService.getAllParents();

      parentList.subscribe(data => {
        var numberOfParents = (data.length+1).toString();
        var newParentId = (data.length+1).toString();
        var newParentUsername = "parent"+numberOfParents;
        this.ffqParent = new FFQParent(newParentId, newParentUsername, newParentUsername, "parent", "", "",  this.selectedClinic, "", []);
        console.log(this.ffqParent);

        this.parentService.addParent(this.ffqParent).subscribe(data => {
            this.router.navigateByUrl('/admin/users');
            const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
            dialogRef.componentInstance.title = newParentUsername + ' was added!';
        },
        error =>{
            const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
            dialogRef.componentInstance.title = error.error.message;
        }); 

      });
  }

  private addParent(form:NgForm){
  
       var parentList: Observable<FFQParentResponse[]> = this.parentService.getAllParents();
 
       parentList.subscribe(data => {
         var numberOfParents = (data.length+1).toString();
         var newParentId = (data.length+1).toString();
         var newParentUsername = "parent"+numberOfParents;
         this.ffqParent = new FFQParent(newParentId, newParentUsername, newParentUsername, "", "", "", []);
         //console.log(this.ffquser);
 
         this.parentService.addParent(this.ffqParent).subscribe(data => {
             this.router.navigateByUrl('/admin/users');
             const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
             dialogRef.componentInstance.title = 'Users were added!';
         },
         error =>{
             const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
             dialogRef.componentInstance.title = error.error.message;
         }); 
 
       });
    
   }


  getParentByID(id: string)
  {
    this.isParent = true;
    this.parentService.getParent(id).subscribe(data => {  
       this.userAttributes = data;
       //this.newParent = data;

    });
    this.dataLoaded = Promise.resolve(true); 
  }

  getClinicianByID(id: string)
  {
    this.isClinician = true;
    this.clinicianService.getClinician(id).subscribe(data => {  
      this.userAttributes = data;
      //this.newClinician = data;
      //console.log(this.userAttributes);
    });
    this.dataLoaded = Promise.resolve(true); 
  }

  updateUser()
  {
    if(this.isParent)
    {
      this.updateParent();
    }
    else
    {
      this.updateClinician();
    }
  }

  updateParent()
  { 

    //this.newParent.assignedclinic = this.clinicIds.get(this.newClinic);

    this.parentService.updateParent(<FFQParentResponse>this.userAttributes).subscribe(
     data => {this.router.navigateByUrl('/admin/users');
     const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
     dialogRef.componentInstance.title = 'Parent successfully updated!';}
     
    );
  }

  updateClinician()
  { 

 
    //console.log("new clinic");
    //console.log(this.newClinic);
    //this.newClinician.assignedclinic = this.clinicIds.get(this.newClinic);
    //console.log(this.newClinician);
 
    this.clinicianService.updateClinician(<FFQClinicianResponse>this.userAttributes)
      .subscribe( data => { 
        console.log("data is");
        console.log(data);
        this.router.navigateByUrl('/admin/users');
        const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
        dialogRef.componentInstance.title = 'Clinician successfully updated!';
      });
  }

  
  deleteUser(){
    if(this.isParent)
    {
      this.deleteParent();
    }
    else
    {
      this.deleteClinician();
    }
  }

  deleteParent(){
    var userName = (<FFQClinicianResponse>this.userAttributes).username;
    this.parentService.deleteItem((<FFQClinicianResponse>this.userAttributes).userId).subscribe( user => { 
      console.log("data is");
      console.log(user);
      this.router.navigateByUrl('/admin/users');
      const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
      dialogRef.componentInstance.title = userName + ' removed';
    });
  }

  deleteClinician(){ 
    var userName = (<FFQClinicianResponse>this.userAttributes).username;
    this.clinicianService.deleteItem((<FFQClinicianResponse>this.userAttributes).userId).subscribe( user => { 
      console.log("data is");
      console.log(user);
      this.router.navigateByUrl('/admin/users');
      const dialogRef = this.errorDialog.open(ErrorDialogPopupComponent);
      dialogRef.componentInstance.title = userName + ' removed';
    });
  }
}


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppitemslistCatalogueReportComponent } from './components/appitemslist-catalogue-report.component';

const relativeRoute = "print"
const routes: Routes = [
    { path: 'print/:listId' , component : AppitemslistCatalogueReportComponent },
    { path: 'print' , component : AppitemslistCatalogueReportComponent },
    { path:"**" , redirectTo: relativeRoute },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppitemsCatalogueReportRoutingModule { }

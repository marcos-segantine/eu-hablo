import { Routes } from '@angular/router';

import { MsalGuard } from '@azure/msal-angular';

import { HomeComponent } from './pages/home/home.component';
import { ChatComponent } from './pages/chat/chat.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
    },
    {
        path: "chat",
        component: ChatComponent,
        canActivate: [MsalGuard],
    },
];

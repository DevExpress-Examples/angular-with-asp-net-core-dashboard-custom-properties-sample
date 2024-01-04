import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DxDashboardControlModule } from 'devexpress-dashboard-angular';
import { DashboardControl, DashboardControlArgs, DashboardPanelExtension} from 'devexpress-dashboard';
import { ChartScaleBreaksExtension } from './extensions/chart-scale-breaks-extension';
import { ChartLineOptionsExtension } from './extensions/chart-line-options-extension';
import { ChartAxisMaxValueExtension } from './extensions/chart-axis-max-value-extension';
import { ChartConstantLinesExtension } from './extensions/chart-constant-lines-extension';
import { ItemDescriptionExtension } from './extensions/item-description-extension';
import { DashboardDescriptionExtension } from './extensions/dashboard-description-extension';
import { GridHeaderFilterExtension } from './extensions/grid-header-filter-extension';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DxDashboardControlModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DashboardAngularApp';
  
  onBeforeRender(args: DashboardControlArgs) {
    var dashboardControl = args.component;
    dashboardControl.registerExtension(new DashboardPanelExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartScaleBreaksExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartLineOptionsExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartAxisMaxValueExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartConstantLinesExtension(dashboardControl));
    dashboardControl.registerExtension(new ItemDescriptionExtension(dashboardControl));
    dashboardControl.registerExtension(new DashboardDescriptionExtension(dashboardControl));
    dashboardControl.registerExtension(new GridHeaderFilterExtension(dashboardControl));
  }
}

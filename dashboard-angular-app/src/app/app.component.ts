import { Component } from '@angular/core';
import { DashboardControl, DashboardControlArgs } from 'devexpress-dashboard';
import { ChartScaleBreaksExtension } from './extensions/chart-scale-breaks-extension';
import { ChartLineOptionsExtension } from './extensions/chart-line-options-extension';
import { ChartAxisMaxValueExtension } from './extensions/chart-axis-max-value-extension';
import { ChartConstantLinesExtension } from './extensions/chart-constant-lines-extension';
import { ItemDescriptionExtension } from './extensions/item-description-extension';
import { DashboardDescriptionExtension } from './extensions/dashboard-description-extension';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dashboard-angular-app';

  onBeforeRender(args: DashboardControlArgs) {
    var dashboardControl = args.component;
    dashboardControl.registerExtension(new ChartScaleBreaksExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartLineOptionsExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartAxisMaxValueExtension(dashboardControl));
    dashboardControl.registerExtension(new ChartConstantLinesExtension(dashboardControl));
    dashboardControl.registerExtension(new ItemDescriptionExtension(dashboardControl));
    dashboardControl.registerExtension(new DashboardDescriptionExtension(dashboardControl));
  }
}

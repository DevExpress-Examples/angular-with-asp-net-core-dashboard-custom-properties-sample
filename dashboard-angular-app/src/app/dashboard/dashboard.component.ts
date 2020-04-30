import { Component, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { DashboardControl, ResourceManager } from 'devexpress-dashboard';
import { ChartScaleBreaksExtension } from './extensions/chart-scale-breaks-extension';
import { ChartLineOptionsExtension } from './extensions/chart-line-options-extension';
import { ChartAxisMaxValueExtension } from './extensions/chart-axis-max-value-extension';
import { ChartConstantLinesExtension } from './extensions/chart-constant-lines-extension';
import { ItemDescriptionExtension } from './extensions/item-description-extension';
import { DashboardDescriptionExtension } from './extensions/dashboard-description-extension';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements AfterViewInit, OnDestroy {
  private dashboardControl!: DashboardControl;
  constructor(private element: ElementRef) {
    ResourceManager.embedBundledResources();
  }
  ngAfterViewInit(): void {
    this.dashboardControl = new DashboardControl(this.element.nativeElement.querySelector(".dashboard-container"), {
      // Specifies a URL of the Web Dashboard's server.
      endpoint: "http://localhost:5000/api",
      workingMode: "Designer",
    });

    this.dashboardControl.registerExtension(new ChartScaleBreaksExtension(this.dashboardControl))
    this.dashboardControl.registerExtension(new ChartLineOptionsExtension(this.dashboardControl))
    this.dashboardControl.registerExtension(new ChartAxisMaxValueExtension(this.dashboardControl))
    this.dashboardControl.registerExtension(new ChartConstantLinesExtension(this.dashboardControl))
    this.dashboardControl.registerExtension(new ItemDescriptionExtension(this.dashboardControl))
    this.dashboardControl.registerExtension(new DashboardDescriptionExtension(this.dashboardControl))

    this.dashboardControl.render();
  }
  ngOnDestroy(): void {
    this.dashboardControl && this.dashboardControl.dispose();
  }
}

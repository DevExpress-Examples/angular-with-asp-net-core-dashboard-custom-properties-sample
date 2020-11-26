import * as Dashboard from 'devexpress-dashboard'
import * as Model from 'devexpress-dashboard/model'
import * as Designer from 'devexpress-dashboard/designer'

// 1. Model
const dashStyleProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.SimpleSeries,
    propertyName: "DashStyleProperty",
    defaultValue: "solid",
    valueType: 'string'
};

Model.registerCustomProperty(dashStyleProperty);

// 2. Viewer
function onItemWidgetOptionsPrepared(args) {
    if (args.dashboardItem instanceof Model.ChartItem) {
        var seriesOptionArray = args.options['series'] || [];
        seriesOptionArray.forEach(function(seriesOption) {
            if (seriesOption.type === "line") {
                var series = args.chartContext.getDashboardItemSeries(seriesOption);
                if (series) {
                    var dashStyle = series.customProperties.getValue(dashStyleProperty.propertyName);
                    seriesOption.dashStyle = dashStyle;
                }
            }
        });
    }
};

// 3. Designer
function onCustomizeSections(args) {
    var simpleSeries = args.dataItemContainer;
    if (simpleSeries instanceof Model.SimpleSeries
        && ['Line', 'FullStackedLine', 'StackedLine', 'StepLine', 'Spline'].indexOf(simpleSeries.seriesType()) !== -1
    ) {
        args.addSection({
            title: "Line Options (Custom)",
            items: [
                {
                    dataField: dashStyleProperty.propertyName,
                    editorType: "dxSelectBox",
                    label: {
                        text: 'Dash style'
                    },
                    editorOptions: {
                        items: [
                            { value: 'dash', displayValue: "Dashes" },
                            { value: 'dot', displayValue: "Dots" },
                            { value: 'longDash', displayValue: "Long Dashes" },
                            { value: 'solid', displayValue: "Solid Line" },
                            { value: 'dashdot', displayValue: "Dash-Dots" }
                        ],
                        displayExpr: "displayValue",
                        valueExpr: "value"
                    }
                }
            ]
        });
    }
};

// 4. Event Subscription
export class ChartLineOptionsExtension {
    name = 'ChartLineOptions'

    constructor(private dashboardControl: Dashboard.DashboardControl) {
    }

    start() {
        let viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.on('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared);
        }
        let bindingPanelExtension = <Designer.BindingPanelExtension>this.dashboardControl.findExtension("item-binding-panel");
        if (bindingPanelExtension) {
            bindingPanelExtension.on('customizeDataItemContainerSections', onCustomizeSections);
        }
    }
    stop() {
        let viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.off('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared);
        }
        let bindingPanelExtension = <Designer.BindingPanelExtension>this.dashboardControl.findExtension("item-binding-panel");
        if (bindingPanelExtension) {
            bindingPanelExtension.off('customizeDataItemContainerSections', onCustomizeSections);
        }
    }
}


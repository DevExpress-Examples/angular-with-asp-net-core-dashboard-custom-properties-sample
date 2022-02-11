import * as Dashboard from 'devexpress-dashboard';
import * as Model from 'devexpress-dashboard/model';
import * as Designer from 'devexpress-dashboard/designer';

// 1. Model
var autoScaleBreaksProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.ChartItem,
    propertyName: 'ScaleBreaks',
    defaultValue: false,
    valueType: 'boolean'
};

Model.registerCustomProperty(autoScaleBreaksProperty);

// 2. Viewer
function onItemWidgetOptionsPrepared(args) {
    var scaleBreaks = args.dashboardItem.customProperties.getValue(autoScaleBreaksProperty.propertyName);
    if (scaleBreaks) {
        var valueAxisOptions = args.options["valueAxis"];
        if (valueAxisOptions && valueAxisOptions[0]) {
            valueAxisOptions[0].autoBreaksEnabled = true;
        }
    }
};

// 3. Designer
function onCustomizeSections(args) {
    if (args.dashboardItem instanceof Model.ChartItem) {
        args.addSection({
            title: "Scale breaks (Custom)",
            items: [
                {
                    dataField: autoScaleBreaksProperty.propertyName,
                    editorType: "dxCheckBox",
                    label: {
                        visible: false
                    },
                    editorOptions: {
                        text: "Enable Auto Scale breaks"
                    }
                }
            ]
        });
    }
};
// 4. Event Subscription
export class ChartScaleBreaksExtension {
    name = "ScaleBreaks"

    constructor(private dashboardControl: Dashboard.DashboardControl) {
    }

    start() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.on('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared);
        }
        var optionsPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel");
        if (optionsPanelExtension) {
            optionsPanelExtension.on('customizeSections', onCustomizeSections);
        }
    }
    stop() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.off('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared);
        }
        var optionsPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel");
        if (optionsPanelExtension) {
            optionsPanelExtension.off('customizeSections', onCustomizeSections);
        }
    }
}
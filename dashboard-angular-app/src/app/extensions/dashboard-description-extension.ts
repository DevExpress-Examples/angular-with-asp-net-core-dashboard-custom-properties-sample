import * as Dashboard from 'devexpress-dashboard';
import * as Model from 'devexpress-dashboard/model';
import * as Designer from 'devexpress-dashboard/designer';
import * as ko from 'knockout';
import dxForm from 'devextreme/ui/form';
import dxPopup from 'devextreme/ui/popup';

var svgIcon = '<svg version="1.1" id="iconDescription" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">.dx-dashboard-icon {fill:currentColor;}</style><path class="dx-dashboard-icon" d="M12,3c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S17,3,12,3z M12,19c-3.9,0-7-3.1-7-7s3.1-7,7-7s7,3.1,7,7S15.9,19,12,19z M12,17L12,17c-0.6,0-1-0.4-1-1v-5c0-0.6,0.4-1,1-1l0,0c0.6,0,1,0.4,1,1v5C13,16.6,12.6,17,12,17zM12,9L12,9c-0.6,0-1-0.4-1-1l0,0c0-0.6,0.4-1,1-1l0,0c0.6,0,1,0.4,1,1l0,0C13,8.6,12.6,9,12,9z"/></svg>';
Dashboard.ResourceManager.registerIcon(svgIcon);

// 1. Model
var dashboardDescriptionProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.Dashboard,
    propertyName: "DashboardDescription",
    defaultValue: "",
    valueType: 'string'
};
Model.registerCustomProperty(dashboardDescriptionProperty);

// 2. Viewer
function onDashboardTitleToolbarUpdated(args) {
    var customProperties = args.dashboard.customProperties;
    var description = customProperties.getValue(dashboardDescriptionProperty.propertyName);
    if (description) {
        args.options.actionItems.push({
            type: "button",
            icon: "iconDescription",
            tooltip: description
        });
    }
};

// 3. Designer
function showPopup(dashboardControl) {
    var div = document.createElement('div');
    document.body.appendChild(div);
    var form = null;
    var popup = new dxPopup(div, {
        title: "Dashboard Description",
        width: '400px',
        height: '300px',
        contentTemplate: (contentElement) => {
            form = new dxForm(contentElement, {
                labelLocation: "top",
                formData: {
                    "description": dashboardControl.dashboard().customProperties.getValue(dashboardDescriptionProperty.propertyName)
                },

                items: [{
                    dataField: "description",
                    label: { visible: false },
                    editorType: "dxTextArea",
                    editorOptions: {
                        height: 150,
                    }
                }]
            })
        },
        onHidden: function (e) {
            e.component.dispose();
            document.body.removeChild(div);
        },
        toolbarItems: [{
            widget: "dxButton",
            toolbar: "bottom",
            options: {
                text: "Save",
                onClick: function () {
                    var description = form.option("formData")["description"];

                    dashboardControl.dashboard().customProperties.setValue(dashboardDescriptionProperty.propertyName, description);
                    var viewerApiExtension = dashboardControl.findExtension('viewer-api');
                    if (viewerApiExtension) {
                        viewerApiExtension.updateDashboardTitleToolbar();
                    }
                    popup.hide();
                }
            }
        },
        {
            widget: "dxButton",
            toolbar: "bottom",
            options: {
                text: "Close",
                onClick: function () {
                    popup.hide();
                }
            }
        }]
    });
    popup.show();
}
function createMenuItem(dashboardControl) {
    var menuItem = new Designer.DashboardMenuItem(name, "Description  (Custom)", 9999, 68);
    menuItem.disabled = ko.computed(function () { return !dashboardControl.dashboard() });

    menuItem.click = function () { showPopup(dashboardControl) };
    return menuItem;
}

// 4. Event Subscription
export class DashboardDescriptionExtension {

    name = "DashboardDescription"
    menuItem: Designer.DashboardMenuItem;

    constructor(private dashboardControl: Dashboard.DashboardControl) {
        this.menuItem = createMenuItem(dashboardControl)
    }

    start() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.on('dashboardTitleToolbarUpdated', onDashboardTitleToolbarUpdated);
        }
        var toolboxExtension = <Designer.ToolboxExtension>this.dashboardControl.findExtension("toolbox");
        if (toolboxExtension) {
            toolboxExtension.menuItems.push(this.menuItem);
        }
    }
    stop() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.off('dashboardTitleToolbarUpdated', onDashboardTitleToolbarUpdated);
        }
        var toolboxExtension = <Designer.ToolboxExtension>this.dashboardControl.findExtension("toolbox");
        if (toolboxExtension) {
            toolboxExtension.menuItems.remove(this.menuItem);
        }
    }
}
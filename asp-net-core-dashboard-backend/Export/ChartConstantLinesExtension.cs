
using DevExpress.DashboardCommon;
using DevExpress.DashboardCommon.ViewerData;
using DevExpress.DashboardWeb;
using DevExpress.XtraCharts;
using DevExpress.XtraReports.UI;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace AspNetCoreDashboardCustomPropertiesSample {
    public class CustomConstantLine {
        public int key { get; set; }
        public string name { get; set; }
        public bool isBound { get; set; }
        public string measureId { get; set; }
        public double value { get; set; }
        public string color { get; set; }
        public string labelText { get; set; }
    }

    public static class ChartConstantLinesExtension {
        public static void CustomExport(CustomExportWebEventArgs e) {
            Dictionary<string, XRControl> controls = e.GetPrintableControls();
            foreach(var control in controls) {
                string componentName = control.Key;
                XRChart chartControl = control.Value as XRChart;
                ChartDashboardItem chartItem = e.GetDashboardItem(componentName) as ChartDashboardItem;
                if(chartControl != null && chartItem != null) {
                    string constantLinesJSON = chartItem.CustomProperties["ConstantLineSettings"];
                    if(constantLinesJSON != null) {
                        XYDiagram diagram = chartControl.Diagram as XYDiagram;
                        if(diagram != null) {
                            List<CustomConstantLine> customConstantLines = JsonConvert.DeserializeObject<List<CustomConstantLine>>(constantLinesJSON);
                            customConstantLines.ForEach(customConstantLine =>
                            {
                                ConstantLine line = new ConstantLine();
                                line.Visible = true;
                                line.ShowInLegend = false;
                                line.Color = ColorTranslator.FromHtml(customConstantLine.color);
                                line.Title.Text = customConstantLine.labelText;
                                line.LineStyle.DashStyle = DashStyle.Dash;
                                line.LineStyle.Thickness = 2;
                                if(customConstantLine.isBound) {
                                    MultiDimensionalData data = e.GetItemData(componentName);
                                    MeasureDescriptor measure = data.GetMeasures().FirstOrDefault(m => m.ID == customConstantLine.measureId);
                                    if(measure != null)
                                        line.AxisValue = data.GetValue(measure).Value;
                                } else
                                    line.AxisValue = customConstantLine.value;


                                if(diagram.SecondaryAxesY.Count > 0)
                                    diagram.SecondaryAxesY[0].ConstantLines.Add(line);
                            });
                        }
                    }
                }
            }
        }
    }
}
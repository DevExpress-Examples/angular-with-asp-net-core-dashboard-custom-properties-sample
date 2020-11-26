Imports DevExpress.DashboardCommon
Imports DevExpress.DashboardCommon.ViewerData
Imports DevExpress.DashboardWeb
Imports DevExpress.XtraCharts
Imports DevExpress.XtraReports.UI
Imports Newtonsoft.Json
Imports System.Collections.Generic
Imports System.Drawing
Imports System.Linq

Namespace AspNetCoreDashboardCustomPropertiesSample
	Public Class CustomConstantLine
		Public Property key() As Integer
		Public Property name() As String
		Public Property isBound() As Boolean
		Public Property measureId() As String
		Public Property value() As Double
		Public Property color() As String
		Public Property labelText() As String
	End Class

	Public Module ChartConstantLinesExtension
		Public Sub CustomExport(ByVal e As CustomExportWebEventArgs)
			Dim controls As Dictionary(Of String, XRControl) = e.GetPrintableControls()
			For Each control In controls
				Dim componentName As String = control.Key
				Dim chartControl As XRChart = TryCast(control.Value, XRChart)
				Dim chartItem As ChartDashboardItem = TryCast(e.GetDashboardItem(componentName), ChartDashboardItem)
				If chartControl IsNot Nothing AndAlso chartItem IsNot Nothing Then
					Dim constantLinesJSON As String = chartItem.CustomProperties("ConstantLineSettings")
					If constantLinesJSON IsNot Nothing Then
						Dim diagram As XYDiagram = TryCast(chartControl.Diagram, XYDiagram)
						If diagram IsNot Nothing Then
							Dim customConstantLines As List(Of CustomConstantLine) = JsonConvert.DeserializeObject(Of List(Of CustomConstantLine))(constantLinesJSON)
							customConstantLines.ForEach(Sub(customConstantLine)
								Dim line As New ConstantLine()
								line.Visible = True
								line.ShowInLegend = False
								line.Color = ColorTranslator.FromHtml(customConstantLine.color)
								line.Title.Text = customConstantLine.labelText
								line.LineStyle.DashStyle = DashStyle.Dash
								line.LineStyle.Thickness = 2
								If customConstantLine.isBound Then
									Dim data As MultiDimensionalData = e.GetItemData(componentName)
									Dim measure As MeasureDescriptor = data.GetMeasures().FirstOrDefault(Function(m) m.ID = customConstantLine.measureId)
									If measure IsNot Nothing Then
										line.AxisValue = data.GetValue(measure).Value
									End If
								Else
									line.AxisValue = customConstantLine.value
								End If


								If diagram.SecondaryAxesY.Count > 0 Then
									diagram.SecondaryAxesY(0).ConstantLines.Add(line)
								End If
							End Sub)
						End If
					End If
				End If
			Next control
		End Sub
	End Module
End Namespace
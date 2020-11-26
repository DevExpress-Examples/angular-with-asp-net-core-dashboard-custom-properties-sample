Imports DevExpress.DashboardCommon
Imports DevExpress.DashboardWeb
Imports Microsoft.AspNetCore.Http
Imports Newtonsoft.Json
Imports System
Imports System.Collections.Generic
Imports System.IO
Imports System.Xml.Linq

Namespace AspNetCoreDashboardCustomPropertiesSample
	Public Class SessionDashboardStorage
		Inherits DashboardStorageBase

		Private Const DashboardStorageKey As String = "74cba564-c821-439c-a714-40ff6027b1eb"

		Private ReadOnly сontextAccessor As IHttpContextAccessor

		Protected ReadOnly Property HttpContext() As HttpContext
			Get
				Return сontextAccessor?.HttpContext
			End Get
		End Property

		Public Sub New(ByVal contextAccessor As IHttpContextAccessor)
			MyBase.New()
			сontextAccessor = contextAccessor
		End Sub

		Private Function ReadFromSession() As Dictionary(Of String, String)
			Dim result As Dictionary(Of String, String) = Nothing
			Dim session As ISession = HttpContext?.Session
			If session IsNot Nothing Then
				Dim serializedStorage As String = If(session.GetString(DashboardStorageKey), String.Empty)
				result = JsonConvert.DeserializeObject(Of Dictionary(Of String, String))(serializedStorage)
				If result Is Nothing Then
					result = Initialize()
					SaveToSession(result)
				End If
			End If
			Return result
		End Function
		Private Sub SaveToSession(ByVal storage As Dictionary(Of String, String))
			HttpContext?.Session?.SetString(DashboardStorageKey, JsonConvert.SerializeObject(storage))
		End Sub
		Private Function Initialize() As Dictionary(Of String, String)
			Dim storage As New Dictionary(Of String, String)()
			For Each file As String In Directory.EnumerateFiles(DirectCast(AppDomain.CurrentDomain.GetData("DataDirectory"), String), "Dashboards/*.xml")
				InitializeCore(Path.GetFileNameWithoutExtension(file), storage)
			Next file
			Return storage
		End Function
		Private Sub InitializeCore(ByVal dashboardID As String, ByVal storage As Dictionary(Of String, String))
			Dim dataDirectoryPath As String = DirectCast(AppDomain.CurrentDomain.GetData("DataDirectory"), String)
			Dim filePath As String = Path.Combine(dataDirectoryPath, "Dashboards", $"{dashboardID}.xml")
			If Not storage.ContainsKey(dashboardID) AndAlso File.Exists(filePath) Then
				Using reader As New StreamReader(filePath)
					storage.Add(dashboardID, reader.ReadToEnd())
				End Using
			End If
		End Sub

		Protected Overrides Function GetAvailableDashboardsID() As IEnumerable(Of String)
			Return ReadFromSession().Keys
		End Function
		Protected Overrides Function LoadDashboard(ByVal dashboardID As String) As XDocument
			Dim storage As Dictionary(Of String, String) = ReadFromSession()
			Return XDocument.Parse(storage(dashboardID))
		End Function
		Protected Overrides Sub SaveDashboard(ByVal dashboardID As String, ByVal dashboard As XDocument, ByVal createNew As Boolean)
			Dim storage As Dictionary(Of String, String) = ReadFromSession()
			If createNew Xor storage.ContainsKey(dashboardID) Then
				storage(dashboardID) = dashboard.Document.ToString()
				SaveToSession(storage)
			End If
		End Sub
	End Class
End Namespace

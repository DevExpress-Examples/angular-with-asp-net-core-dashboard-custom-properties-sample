Imports System
Imports System.IO
Imports DevExpress.AspNetCore
Imports DevExpress.DashboardAspNetCore
Imports DevExpress.DashboardCommon
Imports DevExpress.DashboardWeb
Imports DevExpress.DataAccess.Excel
Imports DevExpress.DataAccess.Sql
Imports Microsoft.AspNetCore.Builder
Imports Microsoft.AspNetCore.Hosting
Imports Microsoft.AspNetCore.Http
Imports Microsoft.Extensions.Configuration
Imports Microsoft.Extensions.DependencyInjection
Imports Microsoft.Extensions.DependencyInjection.Extensions
Imports Microsoft.Extensions.FileProviders

Namespace AspNetCoreDashboardCustomPropertiesSample
	Public Class Startup
		Public Sub New(ByVal configuration As IConfiguration, ByVal hostingEnvironment As IHostingEnvironment)
			Dim dataDirectoryPath As String = Path.Combine(hostingEnvironment.ContentRootPath, "Data")
			AppDomain.CurrentDomain.SetData("DataDirectory", dataDirectoryPath)

			Me.Configuration = configuration
			FileProvider = hostingEnvironment.ContentRootFileProvider
			DashboardExportSettings.CompatibilityMode = DashboardExportCompatibilityMode.Restricted
		End Sub

		Public ReadOnly Property FileProvider() As IFileProvider
		Public ReadOnly Property Configuration() As IConfiguration

		' This method gets called by the runtime. Use this method to add services to the container.
		Public Sub ConfigureServices(ByVal services As IServiceCollection)
			services.AddCors(Sub(options)
				options.AddPolicy("AllowAnyOrigin", Sub(builder)
					builder.AllowAnyOrigin()
					builder.AllowAnyHeader()
					builder.AllowAnyMethod()
				End Sub)
			End Sub).AddMvc().AddDefaultDashboardController(Sub(configurator, serviceProvider)
				configurator.SetConnectionStringsProvider(New DashboardConnectionStringsProvider(Configuration))
				configurator.SetDashboardStorage(serviceProvider.GetService(Of SessionDashboardStorage)())
				AddHandler configurator.CustomExport, Sub(s, e)
					ChartConstantLinesExtension.CustomExport(e)
				End Sub
				AddHandler configurator.ConfigureItemDataCalculation, Sub(s, e)
					e.CalculateAllTotals = True
				End Sub
				Dim dataSourceStorage As New DataSourceInMemoryStorage()
				Dim sqlDataSource As New DashboardSqlDataSource("SQL Data Source", "NWindConnectionString")
				sqlDataSource.DataProcessingMode = DataProcessingMode.Client
				Dim query As SelectQuery = SelectQueryFluentBuilder.AddTable("Categories").Join("Products", "CategoryID").SelectAllColumns().Build("Products_Categories")
				sqlDataSource.Queries.Add(query)
				dataSourceStorage.RegisterDataSource("sqlDataSource", sqlDataSource.SaveToXml())
				Dim objDataSource As New DashboardObjectDataSource("Object Data Source")
				dataSourceStorage.RegisterDataSource("objDataSource", objDataSource.SaveToXml())
				Dim excelDataSource As New DashboardExcelDataSource("Excel Data Source")
				excelDataSource.FileName = FileProvider.GetFileInfo("Data/Sales.xlsx").PhysicalPath
				excelDataSource.SourceOptions = New ExcelSourceOptions(New ExcelWorksheetSettings("Sheet1"))
				dataSourceStorage.RegisterDataSource("excelDataSource", excelDataSource.SaveToXml())
				configurator.SetDataSourceStorage(dataSourceStorage)
				AddHandler configurator.DataLoading, Sub(s, e)
					If e.DataSourceName = "Object Data Source" Then
						e.Data = Invoices.CreateData()
					End If
				End Sub
			End Sub)

			services.AddDevExpressControls()

			services.AddDistributedMemoryCache().AddSession()
			services.TryAddSingleton(Of IHttpContextAccessor, HttpContextAccessor)()
			services.AddTransient(Of SessionDashboardStorage)()
		End Sub

		' This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		Public Sub Configure(ByVal app As IApplicationBuilder, ByVal env As IHostingEnvironment)
			app.UseCors("AllowAnyOrigin")
			app.UseDevExpressControls()
			If env.IsDevelopment() Then
				app.UseDeveloperExceptionPage()
			Else
				app.UseExceptionHandler("/Home/Error")
			End If
			app.UseStaticFiles()
			app.UseSession()
			app.UseMvc(Sub(routes)
				routes.MapDashboardRoute("api")
				routes.MapRoute(name:= "default", template:= "{controller=Home}/{action=Index}/{id?}")
			End Sub)
		End Sub
	End Class
End Namespace
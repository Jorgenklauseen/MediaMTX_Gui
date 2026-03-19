FROM node:20-alpine AS frontend-build
WORKDIR /src
COPY mediamtx_gui.client/package*.json ./mediamtx_gui.client/
RUN cd mediamtx_gui.client && npm ci
COPY mediamtx_gui.client/ ./mediamtx_gui.client/
RUN cd mediamtx_gui.client && npm run build


FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY MediaMTX_Gui.Server/ ./MediaMTX_Gui.Server/
COPY --from=frontend-build /src/mediamtx_gui.client/dist ./MediaMTX_Gui.Server/wwwroot
RUN cd MediaMTX_Gui.Server && dotnet publish -c Release -o /app/publish \
    /p:SpaRoot= /p:ResolveNpmPackages=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=backend-build /app/publish .
ENTRYPOINT ["dotnet", "MediaMTX_Gui.Server.dll"]
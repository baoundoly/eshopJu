FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["EshopJu.API/EshopJu.API.csproj", "EshopJu.API/"]
COPY ["EshopJu.Application/EshopJu.Application.csproj", "EshopJu.Application/"]
COPY ["EshopJu.Core/EshopJu.Core.csproj", "EshopJu.Core/"]
COPY ["EshopJu.Infrastructure/EshopJu.Infrastructure.csproj", "EshopJu.Infrastructure/"]
RUN dotnet restore "EshopJu.API/EshopJu.API.csproj"
COPY . .
WORKDIR "/src/EshopJu.API"
RUN dotnet build "EshopJu.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EshopJu.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EshopJu.API.dll"]

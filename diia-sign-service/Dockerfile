# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY DiiaSign.Api/DiiaSign.Api.csproj DiiaSign.Api/
RUN dotnet restore DiiaSign.Api/DiiaSign.Api.csproj
COPY DiiaSign.Api/ DiiaSign.Api/
RUN dotnet publish DiiaSign.Api/DiiaSign.Api.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
# test → CACertificates.Test.All.p7b, prod → CACertificates.p7b
ARG DIIA_CA_ENV=test
WORKDIR /app
COPY --from=build /out .
COPY scripts/fetch-ca-certs.sh /tmp/fetch-ca-certs.sh
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && bash /tmp/fetch-ca-certs.sh "$DIIA_CA_ENV" /app/certs \
 && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /tmp/fetch-ca-certs.sh \
 && mkdir -p /app/data && chown app:app /app/data
USER app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__SignDb="Data Source=/app/data/diia-sign.db"
VOLUME /app/data
EXPOSE 8080
ENTRYPOINT ["dotnet", "DiiaSign.Api.dll"]

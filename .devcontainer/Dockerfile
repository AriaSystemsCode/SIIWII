# Use the official Microsoft SQL Server image from the Docker Hub
FROM mcr.microsoft.com/mssql/server:2019-latest

# Set environment variables
ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=YourStrong!Passw0rd

# Expose the SQL Server port
EXPOSE 1433

# Run SQL Server
CMD /opt/mssql/bin/sqlservr

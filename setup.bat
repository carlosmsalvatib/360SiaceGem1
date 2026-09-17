@echo off
echo ============================================
echo INSTALADOR DEL SISTEMA CÓDIGO-58 v2.0
echo ============================================
echo.

echo [1/4] Verificando PHP...
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP no instalado o no en PATH
    pause
    exit
)
echo OK

echo [2/4] Verificando MySQL/MariaDB...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL no instalado o no en PATH
    pause
    exit
)
echo OK

echo [3/4] Creando estructura de directorios...
mkdir uploads 2>nul
mkdir uploads\documentos 2>nul
mkdir uploads\comprobantes 2>nul
echo OK

echo [4/4] Instalando base de datos...
mysql -u root < database.sql
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear la base de datos
    echo Verifica que MySQL este corriendo y las credenciales sean correctas
    pause
    exit
)
echo OK

echo.
echo ============================================
echo ¡INSTALACION COMPLETADA EXITOSAMENTE!
echo ============================================
echo.
echo Credenciales de acceso:
echo   Email: admin@consultoria.com
echo   Password: password
echo.
echo Accede a: http://localhost/consultoria_mof/
echo.

pause